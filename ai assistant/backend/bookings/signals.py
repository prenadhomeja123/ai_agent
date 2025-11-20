"""
Signals for booking model
Handles calendar integration and no-show tracking
"""

from django.db.models.signals import post_save, post_init
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Booking
from automations.services import trigger_automations
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Booking)
def handle_booking_save(sender, instance, created, **kwargs):
    """Handle booking creation and updates"""
    if created:
        # New booking created - add to calendar
        logger.info(f"New booking created: {instance.id}")
        
        # Add to calendar if configured
        try:
            from calendar_integration.services import CalendarService
            calendar = CalendarService(instance.user, provider='google')
            success, event_id, error = calendar.add_booking_to_calendar(instance)
            
            if success:
                logger.info(f"Booking {instance.id} added to calendar with event ID: {event_id}")
            else:
                logger.warning(f"Failed to add booking to calendar: {error}")
        except Exception as e:
            logger.error(f"Error adding booking to calendar: {str(e)}")
        
        # Trigger booking_created automation
        trigger_automations('booking_created', {
            'user': instance.user,
            'lead': instance.lead,
            'booking': instance
        })
    else:
        # Booking updated - check for status changes
        if hasattr(instance, '_previous_status'):
            if instance._previous_status != instance.status:
                logger.info(f"Booking status changed: {instance.id} ({instance._previous_status} -> {instance.status})")
                
                # Handle no-show
                if instance.status == 'no_show':
                    # Trigger no-show follow-up automation
                    trigger_automations('no_show', {
                        'user': instance.user,
                        'lead': instance.lead,
                        'booking': instance
                    })
                    
                    # Also trigger no_show_followup automation type
                    trigger_automations('no_show_followup', {
                        'user': instance.user,
                        'lead': instance.lead,
                        'booking': instance
                    })
                
                # Handle completion
                elif instance.status == 'completed':
                    # Trigger post-session follow-up
                    trigger_automations('session_completed', {
                        'user': instance.user,
                        'lead': instance.lead,
                        'booking': instance
                    })
                
                # Handle cancellation
                elif instance.status == 'cancelled':
                    # Update CRM if needed
                    trigger_automations('booking_cancelled', {
                        'user': instance.user,
                        'lead': instance.lead,
                        'booking': instance
                    })


@receiver(post_init, sender=Booking)
def store_previous_status(sender, instance, **kwargs):
    """Store previous status to detect changes"""
    if instance.pk:
        try:
            original = Booking.objects.get(pk=instance.pk)
            instance._previous_status = original.status
        except Booking.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None

