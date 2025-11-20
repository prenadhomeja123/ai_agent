"""
Onboarding API views
Handles white-glove onboarding flow
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import OnboardingStep
from .serializers import OnboardingStepSerializer
from settings.models import UserSettings
from settings.simplybook_service import SimplyBookService
import logging

logger = logging.getLogger(__name__)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def onboarding_status(request):
    """Get or update onboarding status"""
    try:
        onboarding = OnboardingStep.objects.get(user=request.user)
    except OnboardingStep.DoesNotExist:
        onboarding = OnboardingStep.objects.create(user=request.user)
    
    if request.method == 'GET':
        serializer = OnboardingStepSerializer(onboarding)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Update onboarding step
        step = request.data.get('step')
        if step:
            onboarding.current_step = step
            onboarding.mark_step_complete(step)
            onboarding.save()
        
        # Update credentials if provided
        data = request.data
        
        if 'crm' in data:
            onboarding.crm_provider = data['crm'].get('provider', onboarding.crm_provider)
            onboarding.crm_api_key = data['crm'].get('api_key', onboarding.crm_api_key)
            onboarding.crm_company_login = data['crm'].get('company_login', onboarding.crm_company_login)
        
        if 'booking' in data:
            onboarding.booking_provider = data['booking'].get('provider', onboarding.booking_provider)
            onboarding.booking_api_key = data['booking'].get('api_key', onboarding.booking_api_key)
        
        if 'email' in data:
            onboarding.email_provider = data['email'].get('provider', onboarding.email_provider)
            onboarding.email_smtp_host = data['email'].get('smtp_host', onboarding.email_smtp_host)
            onboarding.email_smtp_user = data['email'].get('smtp_user', onboarding.email_smtp_user)
            onboarding.email_smtp_password = data['email'].get('smtp_password', onboarding.email_smtp_password)
        
        if 'sms' in data:
            onboarding.sms_provider = data['sms'].get('provider', onboarding.sms_provider)
            onboarding.sms_twilio_sid = data['sms'].get('twilio_sid', onboarding.sms_twilio_sid)
            onboarding.sms_twilio_token = data['sms'].get('twilio_token', onboarding.sms_twilio_token)
            onboarding.sms_twilio_phone = data['sms'].get('twilio_phone', onboarding.sms_twilio_phone)
        
        if 'whatsapp' in data:
            onboarding.whatsapp_provider = data['whatsapp'].get('provider', onboarding.whatsapp_provider)
            onboarding.whatsapp_twilio_sid = data['whatsapp'].get('twilio_sid', onboarding.whatsapp_twilio_sid)
            onboarding.whatsapp_twilio_token = data['whatsapp'].get('twilio_token', onboarding.whatsapp_twilio_token)
        
        if 'facebook' in data:
            onboarding.facebook_page_id = data['facebook'].get('page_id', onboarding.facebook_page_id)
            onboarding.facebook_access_token = data['facebook'].get('access_token', onboarding.facebook_access_token)
        
        if 'instagram' in data:
            onboarding.instagram_account_id = data['instagram'].get('account_id', onboarding.instagram_account_id)
            onboarding.instagram_access_token = data['instagram'].get('access_token', onboarding.instagram_access_token)
        
        onboarding.save()
        
        # If step is complete, apply credentials to UserSettings
        if onboarding.current_step == 'complete':
            apply_onboarding_to_settings(onboarding)
        
        serializer = OnboardingStepSerializer(onboarding)
        return Response(serializer.data)


def apply_onboarding_to_settings(onboarding):
    """Apply onboarding credentials to UserSettings"""
    try:
        settings = UserSettings.objects.get(user=onboarding.user)
    except UserSettings.DoesNotExist:
        settings = UserSettings.objects.create(user=onboarding.user)
    
    # Apply CRM settings
    if onboarding.crm_api_key:
        settings.crm_provider = onboarding.crm_provider or 'SimplyBook.me'
        settings.crm_api_key = onboarding.crm_api_key
        settings.crm_connected = True
        settings.save()
    
    # Apply email settings (would need to update .env or use a settings storage)
    # For now, we'll just mark that onboarding is complete
    logger.info(f"Onboarding completed for {onboarding.user.email}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_crm_connection(request):
    """Test CRM connection during onboarding"""
    crm_api_key = request.data.get('api_key')
    crm_provider = request.data.get('provider', 'SimplyBook.me')
    
    if not crm_api_key:
        return Response({'error': 'API key is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if crm_provider == 'SimplyBook.me':
            simplybook = SimplyBookService(api_key=crm_api_key, company_login=None)
            clients = simplybook.get_clients(limit=1)
            
            if clients is not None:
                return Response({
                    'success': True,
                    'message': 'CRM connection successful',
                    'clients_found': len(clients) if isinstance(clients, list) else 0
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Failed to connect to CRM. Please check your API key.'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'success': False,
                'error': f'CRM provider {crm_provider} not yet supported'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"CRM connection test error: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

