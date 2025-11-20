"""
Message processing services
Handles inbound message processing and auto-reply functionality
"""

import logging
from django.utils import timezone
from messages.models import Message
from ai_integration.views import generate_ai_response
from ai_integration.models import AgentActivity
from messaging.services import MessageSender

logger = logging.getLogger(__name__)


def process_inbound_message(message: Message):
    """
    Process an inbound message and optionally send auto-reply
    
    Args:
        message: Message model instance (must be inbound)
        
    Returns:
        Message or None: Auto-reply message if sent, None otherwise
    """
    if message.direction != 'inbound':
        logger.warning(f"process_inbound_message called for outbound message {message.id}")
        return None
    
    try:
        # Check if auto-reply is enabled (can be added to settings later)
        # For now, we'll auto-reply to all inbound messages
        
        # Generate AI response
        from django.test import RequestFactory
        from rest_framework.test import force_authenticate
        
        # Create a mock request for AI generation
        factory = RequestFactory()
        request = factory.post('/api/ai/generate', {
            'prompt': f"Reply to this message: {message.content}",
            'context': {
                'lead': {
                    'id': message.lead.id,
                    'name': message.lead.name,
                    'email': message.lead.email
                },
                'conversationHistory': [
                    {'role': 'user', 'content': message.content}
                ]
            }
        })
        request.user = message.user
        
        # Generate response using AI
        try:
            from django.conf import settings
            import google.generativeai as genai
            
            if settings.GEMINI_API_KEY:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel('gemini-2.0-flash')
                
                prompt = f"Reply to this message from {message.lead.name} ({message.lead.email}): {message.content}\n\nWrite a brief, professional, and helpful response."
                
                response = model.generate_content(
                    prompt,
                    generation_config={'max_output_tokens': 200, 'temperature': 0.7}
                )
                
                reply_content = response.text
            else:
                reply_content = f"Thank you for your message, {message.lead.name}. We'll get back to you soon!"
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            reply_content = f"Thank you for your message, {message.lead.name}. We'll get back to you soon!"
        
        # Create auto-reply message
        auto_reply = Message.objects.create(
            user=message.user,
            lead=message.lead,
            channel=message.channel,  # Reply on same channel
            direction='outbound',
            content=reply_content,
            status='pending',
            ai_generated=True,
            timestamp=timezone.now()
        )
        
        # Send the auto-reply
        sender = MessageSender(message.user)
        sent = sender.send_message(auto_reply)
        
        if sent:
            # Log activity
            AgentActivity.objects.create(
                user=message.user,
                type='auto_reply_sent',
                description=f'Auto-reply sent to {message.lead.name} via {message.channel}',
                channel=message.channel,
                lead=message.lead,
                details={
                    'original_message_id': message.id,
                    'reply_message_id': auto_reply.id,
                    'original_content': message.content[:100],
                }
            )
            
            logger.info(f"Auto-reply sent to {message.lead.email} via {message.channel}")
            return auto_reply
        else:
            logger.warning(f"Failed to send auto-reply to {message.lead.email}")
            return None
            
    except Exception as e:
        logger.error(f"Error processing inbound message: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

