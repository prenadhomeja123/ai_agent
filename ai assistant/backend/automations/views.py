from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Automation
from .serializers import AutomationSerializer
from .services import trigger_automations, AutomationExecutor


class AutomationListCreateView(generics.ListCreateAPIView):
    serializer_class = AutomationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Automation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_automation(request, pk):
    try:
        automation = Automation.objects.get(pk=pk, user=request.user)
    except Automation.DoesNotExist:
        return Response({'error': 'Automation not found'}, status=status.HTTP_404_NOT_FOUND)

    automation.enabled = request.data.get('enabled', automation.enabled)
    automation.save()
    serializer = AutomationSerializer(automation)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_automation(request, pk):
    """Test run an automation manually"""
    try:
        automation = Automation.objects.get(pk=pk, user=request.user)
    except Automation.DoesNotExist:
        return Response({'error': 'Automation not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get lead from request if provided
    lead_id = request.data.get('lead_id')
    lead = None
    if lead_id:
        from leads.models import Lead
        try:
            lead = Lead.objects.get(id=lead_id, user=request.user)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
    
    context = {
        'user': request.user,
        'lead': lead
    }
    
    executor = AutomationExecutor(automation, context)
    success = executor.execute()
    
    if success:
        return Response({
            'success': True,
            'message': 'Automation executed successfully',
            'automation': AutomationSerializer(automation).data
        })
    else:
        return Response({
            'success': False,
            'message': 'Automation did not execute (check conditions and delay settings)'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_manual_automation(request):
    """Manually trigger automations for a specific event"""
    trigger_type = request.data.get('trigger_type')
    lead_id = request.data.get('lead_id')
    
    if not trigger_type:
        return Response({'error': 'trigger_type is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    context = {'user': request.user}
    
    if lead_id:
        from leads.models import Lead
        try:
            context['lead'] = Lead.objects.get(id=lead_id, user=request.user)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
    
    executed_count = trigger_automations(trigger_type, context)
    
    return Response({
        'success': True,
        'message': f'Triggered {executed_count} automations',
        'executed_count': executed_count
    })

