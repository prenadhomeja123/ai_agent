from django.db import models
from accounts.models import User
from leads.models import Lead


class AgentActivity(models.Model):
    TYPE_CHOICES = [
        ('message_sent', 'Message Sent'),
        ('message_replied', 'Message Replied'),
        ('followup_triggered', 'Follow-up Triggered'),
        ('crm_updated', 'CRM Updated'),
        ('automation_ran', 'Automation Ran'),
    ]

    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('whatsapp', 'WhatsApp'),
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    description = models.TextField()
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, blank=True, null=True)
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Agent Activities'

    def __str__(self):
        return f"{self.type} - {self.description[:50]}"

