from django.db import models
from accounts.models import User
from leads.models import Lead


class Automation(models.Model):
    TYPE_CHOICES = [
        ('lead_followup', 'Lead Follow-up'),
        ('booking_reminder', 'Booking Reminder'),
        ('confirmation', 'Confirmation'),
        ('post_session', 'Post-Session Follow-up'),
        ('crm_update', 'CRM Record Update'),
        ('no_show_followup', 'No-Show Follow-up'),
    ]

    TRIGGER_CHOICES = [
        ('new_lead', 'New Lead Added'),
        ('lead_status_changed', 'Lead Status Changed'),
        ('no_contact_days', 'No Contact for X Days'),
        ('booking_created', 'Booking Created'),
        ('booking_reminder_hours', 'Booking Reminder (X hours before)'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('session_completed', 'Session Completed'),
        ('no_show', 'No Show'),
        ('message_received', 'Message Received'),
    ]

    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('whatsapp', 'WhatsApp'),
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='automations')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    enabled = models.BooleanField(default=True)
    trigger = models.CharField(max_length=50, choices=TRIGGER_CHOICES)
    
    # Configuration fields
    delay_hours = models.IntegerField(default=24, help_text='Delay in hours before triggering')
    delay_days = models.IntegerField(default=0, help_text='Delay in days before triggering')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='email')
    message_template = models.TextField(blank=True, help_text='Optional message template. Leave empty for AI-generated.')
    conditions = models.JSONField(default=dict, blank=True, help_text='Additional conditions (e.g., lead_status, source)')
    
    # Tracking
    last_triggered = models.DateTimeField(null=True, blank=True)
    times_triggered = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.email})"
    
    def should_trigger(self, context=None):
        """Check if automation should trigger based on conditions"""
        if not self.enabled:
            return False
        
        # Check conditions if provided
        if context and self.conditions:
            for key, value in self.conditions.items():
                if context.get(key) != value:
                    return False
        
        return True

