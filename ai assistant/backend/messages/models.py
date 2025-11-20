from django.db import models
from accounts.models import User
from leads.models import Lead


class Message(models.Model):
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('whatsapp', 'WhatsApp'),
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
    ]

    DIRECTION_CHOICES = [
        ('inbound', 'Inbound'),
        ('outbound', 'Outbound'),
    ]

    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='messages')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    ai_generated = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.direction} {self.channel} to {self.lead.name}"

