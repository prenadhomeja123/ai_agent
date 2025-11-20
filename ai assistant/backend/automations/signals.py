"""
Django signals to trigger automations on events
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from leads.models import Lead
from messages.models import Message
from .services import trigger_automations
import logging

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=Lead)
def store_previous_status(sender, instance, **kwargs):
    """Store previous status to detect changes (only on save, not on load)"""
    if instance.pk:
        try:
            # Use only() to fetch only the status field and use values() to avoid model instantiation
            # This prevents post_init signal from firing and causing recursion
            original = Lead.objects.filter(pk=instance.pk).values('status').first()
            if original:
                instance._previous_status = original['status']
            else:
                instance._previous_status = None
        except Exception:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=Lead)
def trigger_lead_automations(sender, instance, created, **kwargs):
    """Trigger automations when a lead is created or updated"""
    if created:
        # New lead added
        logger.info(f"New lead created: {instance.id}")
        trigger_automations('new_lead', {
            'user': instance.user,
            'lead': instance
        })
    else:
        # Check if status changed
        if hasattr(instance, '_previous_status'):
            if instance._previous_status != instance.status:
                logger.info(f"Lead status changed: {instance.id} ({instance._previous_status} -> {instance.status})")
                trigger_automations('lead_status_changed', {
                    'user': instance.user,
                    'lead': instance,
                    'old_status': instance._previous_status,
                    'new_status': instance.status
                })


@receiver(post_save, sender=Message)
def trigger_message_automations(sender, instance, created, **kwargs):
    """Trigger automations when a message is received"""
    if created and instance.direction == 'inbound':
        logger.info(f"Inbound message received: {instance.id}")
        
        # Process inbound message (auto-reply)
        try:
            from messages.services import process_inbound_message
            process_inbound_message(instance)
        except Exception as e:
            logger.error(f"Error processing inbound message: {str(e)}")
        
        # Trigger automations
        trigger_automations('message_received', {
            'user': instance.user,
            'lead': instance.lead,
            'message': instance
        })

