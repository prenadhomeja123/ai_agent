from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime
from django.conf import settings
from .models import AgentActivity
from leads.models import Lead


@api_view(['POST'])
def generate_ai_response(request):
    prompt = request.data.get('prompt')
    context = request.data.get('context', {})

    if not prompt:
        return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Initialize Gemini client
        if not settings.GEMINI_API_KEY:
            return Response({'error': 'Gemini API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Get conversation history if provided
        conversation_history = context.get('conversationHistory', [])
        
        # Build context about the lead
        lead_info = ""
        if context.get('lead'):
            lead_name = context['lead'].get('name', 'the lead')
            lead_email = context['lead'].get('email', '')
            lead_info = f"You are helping to communicate with {lead_name}"
            if lead_email:
                lead_info += f" ({lead_email})"
        
        # Call Google Gemini API
        import google.generativeai as genai
        
        try:
            # Configure Gemini
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Use Gemini 2.0 Flash model (fast and efficient)
            # Alternative: 'gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-pro-latest'
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            # Build conversation context for Gemini
            chat_history = []
            
            # Add system instruction
            system_message = "You are an AI assistant helping to write professional, warm, and personalized messages for a coaching/consulting business. Respond naturally to what the user is asking, based on the conversation context. Generate appropriate messages directly without asking for more information."
            
            if lead_info:
                system_message += f" {lead_info}."
            
            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history[-6:]:  # Last 6 messages for context
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    if role == 'user':
                        chat_history.append(f"User: {content}")
                    elif role == 'assistant':
                        chat_history.append(f"Assistant: {content}")
            
            # Build the complete prompt
            if chat_history:
                history_text = "\n".join(chat_history)
                complete_prompt = f"{system_message}\n\nConversation history:\n{history_text}\n\nUser: {prompt}\n\nAssistant:"
            else:
                complete_prompt = f"{system_message}\n\nUser: {prompt}\n\nAssistant:"
            
            print(f"\n[Gemini] Generating response with conversation context...")
            print(f"[Gemini] Prompt: {prompt[:100]}...")
            
            # Generate response
            response = model.generate_content(
                complete_prompt,
                generation_config={
                    'max_output_tokens': 500,
                    'temperature': 0.7,
                }
            )
            
            ai_response = response.text
            print(f"[Gemini] SUCCESS! Response generated")

        except Exception as gemini_error:
            # Log the error for debugging
            error_msg = str(gemini_error)
            print(f"\n[Gemini Error] {error_msg}")
            
            # Provide user-friendly error messages
            error_lower = error_msg.lower()
            if 'api_key' in error_lower or 'invalid' in error_lower or '401' in error_msg or '403' in error_msg:
                raise Exception("Invalid Gemini API Key\n\nPlease check your API key in the .env file. The key may be incorrect or expired.")
            elif 'quota' in error_lower or '429' in error_msg:
                raise Exception("Gemini API Rate Limit Exceeded\n\nPlease wait a few moments and try again.")
            else:
                raise Exception(f"Gemini API error: {error_msg}")

        # Log the activity
        lead_id = context.get('lead', {}).get('id')
        lead = None
        if lead_id:
            try:
                lead = Lead.objects.get(id=lead_id, user=request.user)
            except Lead.DoesNotExist:
                pass

        AgentActivity.objects.create(
            user=request.user,
            type='message_sent',
            description=f'AI generated response: {prompt[:100]}',
            details={'prompt': prompt, 'response': ai_response, 'context': context},
        )

        return Response({'response': ai_response}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_agent_activity(request):
    # Avoid select_related to prevent recursion issues with Python 3.13
    activities = AgentActivity.objects.filter(user=request.user).order_by('-timestamp')

    # Apply filters
    date_from = request.query_params.get('dateFrom')
    date_to = request.query_params.get('dateTo')
    channel = request.query_params.get('channel')

    if date_from:
        activities = activities.filter(timestamp__gte=date_from)
    if date_to:
        activities = activities.filter(timestamp__lte=date_to)
    if channel:
        activities = activities.filter(channel=channel)
    
    # Limit results for performance (default 50, can be overridden)
    limit = request.query_params.get('limit', '50')
    try:
        limit_int = int(limit)
        activities = activities[:limit_int]
    except ValueError:
        pass

    # Use serializer for better performance
    from rest_framework import serializers
    
    class ActivitySerializer(serializers.Serializer):
        id = serializers.IntegerField()
        type = serializers.CharField()
        description = serializers.CharField()
        channel = serializers.CharField(allow_null=True)
        leadId = serializers.IntegerField(source='lead.id', allow_null=True)
        timestamp = serializers.DateTimeField()
        details = serializers.JSONField(allow_null=True)
    
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

