"""
Settings API views
Handles user settings and CRM sync
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import F, Q
from datetime import timedelta
from .models import UserSettings
from .serializers import UserSettingsSerializer
from .simplybook_service import SimplyBookService
import logging

logger = logging.getLogger(__name__)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    try:
        settings = UserSettings.objects.get(user=request.user)
    except UserSettings.DoesNotExist:
        settings = UserSettings.objects.create(user=request.user)

    if request.method == 'GET':
        serializer = UserSettingsSerializer(settings)
        data = serializer.data
        
        # Format response for frontend
        return Response({
            'channels': {
                'email': {'enabled': data['email_enabled'], 'provider': data.get('email_provider', 'Gmail')},
                'sms': {'enabled': data['sms_enabled'], 'provider': data.get('sms_provider', 'Twilio')},
                'whatsapp': {'enabled': data['whatsapp_enabled'], 'provider': data.get('whatsapp_provider', 'Meta')},
                'facebook': {'enabled': data['facebook_enabled'], 'provider': data.get('facebook_provider', 'Meta')},
                'instagram': {'enabled': data['instagram_enabled'], 'provider': data.get('instagram_provider', 'Meta')},
            },
            'crm': {
                'provider': data['crm_provider'],
                'connected': data['crm_connected'],
                'lastSynced': data['crm_last_synced'],
            },
            'automations': {
                'leadFollowup': data['lead_followup_enabled'],
                'bookingReminder': data['booking_reminder_enabled'],
                'confirmation': data['confirmation_enabled'],
                'postSession': data['post_session_enabled'],
            },
            'notifications': {
                'email': data['email_notifications'],
                'sms': data['sms_notifications'],
                'inApp': data['in_app_notifications'],
            },
        })

    elif request.method == 'PUT':
        data = request.data
        
        # Update channel settings
        if 'channels' in data:
            channels = data['channels']
            settings.email_enabled = channels.get('email', {}).get('enabled', settings.email_enabled)
            settings.sms_enabled = channels.get('sms', {}).get('enabled', settings.sms_enabled)
            settings.whatsapp_enabled = channels.get('whatsapp', {}).get('enabled', settings.whatsapp_enabled)
            settings.facebook_enabled = channels.get('facebook', {}).get('enabled', settings.facebook_enabled)
            settings.instagram_enabled = channels.get('instagram', {}).get('enabled', settings.instagram_enabled)

        # Update automation settings
        if 'automations' in data:
            automations = data['automations']
            settings.lead_followup_enabled = automations.get('leadFollowup', settings.lead_followup_enabled)
            settings.booking_reminder_enabled = automations.get('bookingReminder', settings.booking_reminder_enabled)
            settings.confirmation_enabled = automations.get('confirmation', settings.confirmation_enabled)
            settings.post_session_enabled = automations.get('postSession', settings.post_session_enabled)

        # Update notification settings
        if 'notifications' in data:
            notifications = data['notifications']
            settings.email_notifications = notifications.get('email', settings.email_notifications)
            settings.sms_notifications = notifications.get('sms', settings.sms_notifications)
            settings.in_app_notifications = notifications.get('inApp', settings.in_app_notifications)

        # Update CRM settings
        if 'crm' in data:
            crm = data['crm']
            settings.crm_provider = crm.get('provider', settings.crm_provider)
            settings.crm_connected = crm.get('connected', settings.crm_connected)
            
            # Store API key if provided
            if 'apiKey' in crm:
                settings.crm_api_key = crm['apiKey']
        
        settings.save()
        
        # Update automations based on settings
        update_automations_from_settings(settings)
        
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)


def update_automations_from_settings(user_settings):
    """Update automation enabled status based on user settings"""
    from automations.models import Automation
    
    automations = Automation.objects.filter(user=user_settings.user)
    
    for automation in automations:
        should_be_enabled = False
        
        if automation.type == 'lead_followup' and user_settings.lead_followup_enabled:
            should_be_enabled = True
        elif automation.type == 'booking_reminder' and user_settings.booking_reminder_enabled:
            should_be_enabled = True
        elif automation.type == 'confirmation' and user_settings.confirmation_enabled:
            should_be_enabled = True
        elif automation.type == 'post_session' and user_settings.post_session_enabled:
            should_be_enabled = True
        
        if automation.enabled != should_be_enabled:
            automation.enabled = should_be_enabled
            automation.save()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_crm(request):
    """Sync data with CRM (SimplyBook.me) - Two-way sync"""
    try:
        settings = UserSettings.objects.get(user=request.user)
    except UserSettings.DoesNotExist:
        return Response({'error': 'Settings not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if not settings.crm_connected:
        return Response({'error': 'CRM not connected'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not settings.crm_api_key:
        return Response({'error': 'CRM API key not found. Please reconnect your CRM.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Import SimplyBook service
    from .simplybook_service import SimplyBookService
    
    try:
        # Initialize SimplyBook service
        simplybook = SimplyBookService(
            api_key=settings.crm_api_key,
            company_login=None  # Can be added to settings if needed
        )
        
        # Fetch clients from SimplyBook.me
        print(f"[CRM Sync] Fetching clients from SimplyBook.me for user: {request.user.email}")
        clients_data = simplybook.get_clients(limit=100, offset=0)
        
        if clients_data is None:
            return Response({
                'success': False,
                'error': 'Failed to fetch clients from SimplyBook.me. Please check your API key and try again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Sync clients to leads
        created_count, updated_count, errors = simplybook.sync_clients_to_leads(
            user=request.user,
            clients_data=clients_data
        )
        
        # Fetch and sync bookings
        bookings_data = simplybook.get_bookings(
            start_date=timezone.now() - timedelta(days=30),
            end_date=timezone.now(),
            limit=50
        )
        bookings_count = 0
        bookings_created = 0
        bookings_updated = 0
        
        if bookings_data:
            bookings_count = len(bookings_data)
            # Sync bookings to database
            bookings_created, bookings_updated, booking_errors = simplybook.sync_bookings_to_database(
                user=request.user,
                bookings_data=bookings_data
            )
            if booking_errors:
                errors.extend(booking_errors[:5])  # Add first 5 booking errors
        
        # TWO-WAY SYNC: Update CRM with system changes
        from leads.models import Lead
        from bookings.models import Booking
        
        # Sync leads to CRM (system → CRM)
        leads_to_sync = Lead.objects.filter(
            user=request.user,
            crm_synced_at__isnull=True
        ) | Lead.objects.filter(
            user=request.user,
            updated_at__gt=models.F('crm_synced_at')
        )
        
        crm_updated_count = 0
        crm_update_errors = []
        
        for lead in leads_to_sync[:50]:  # Limit to 50 to avoid timeout
            try:
                success, client_id, error = simplybook.sync_lead_to_crm(lead, lead.crm_client_id)
                if success:
                    lead.crm_client_id = client_id
                    lead.crm_synced_at = timezone.now()
                    lead.save()
                    crm_updated_count += 1
                else:
                    crm_update_errors.append(f"Lead {lead.id}: {error}")
            except Exception as e:
                crm_update_errors.append(f"Lead {lead.id}: {str(e)}")
        
        # Sync bookings to CRM (system → CRM)
        bookings_to_sync = Booking.objects.filter(
            user=request.user,
            external_id__isnull=True
        ) | Booking.objects.filter(
            user=request.user,
            updated_at__gt=models.F('created_at')
        )
        
        booking_crm_updated = 0
        
        for booking in bookings_to_sync[:20]:  # Limit to 20
            try:
                if booking.lead.crm_client_id:
                    success, booking_id, error = simplybook.sync_booking_to_crm(booking, booking.lead.crm_client_id)
                    if success:
                        booking.external_id = booking_id
                        booking.save()
                        booking_crm_updated += 1
            except Exception as e:
                crm_update_errors.append(f"Booking {booking.id}: {str(e)}")
        
        # Update last synced timestamp
        settings.crm_last_synced = timezone.now()
        settings.save()
        
        # Prepare response
        response_data = {
            'success': True,
            'message': 'CRM sync completed successfully',
            'lastSynced': settings.crm_last_synced.isoformat(),
            'stats': {
                'leads_created': created_count,
                'leads_updated': updated_count,
                'bookings_found': bookings_count,
                'bookings_created': bookings_created,
                'bookings_updated': bookings_updated,
                'crm_leads_updated': crm_updated_count,
                'crm_bookings_updated': booking_crm_updated,
                'errors_count': len(errors) + len(crm_update_errors),
                'clients_fetched': len(clients_data) if clients_data else 0,
            }
        }
        
        # Include errors if any
        all_errors = errors + crm_update_errors
        if all_errors:
            response_data['errors'] = all_errors[:10]  # Limit to first 10 errors
            response_data['message'] = f'CRM sync completed with {len(all_errors)} error(s)'
        
        print(f"[CRM Sync] Success: Created {created_count}, Updated {updated_count}, CRM Updated: {crm_updated_count}, Errors: {len(all_errors)}")
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        print(f"[CRM Sync] Error: {error_msg}")
        
        return Response({
            'success': False,
            'error': f'CRM sync failed: {error_msg}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
