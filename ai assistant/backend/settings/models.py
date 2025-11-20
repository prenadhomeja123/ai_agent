from django.db import models
from accounts.models import User


class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_settings')
    
    # Channel settings
    email_enabled = models.BooleanField(default=True)
    email_provider = models.CharField(max_length=100, default='Gmail', blank=True)
    sms_enabled = models.BooleanField(default=True)
    sms_provider = models.CharField(max_length=100, default='Twilio', blank=True)
    whatsapp_enabled = models.BooleanField(default=False)
    whatsapp_provider = models.CharField(max_length=100, default='Meta', blank=True)
    facebook_enabled = models.BooleanField(default=False)
    facebook_provider = models.CharField(max_length=100, default='Meta', blank=True)
    instagram_enabled = models.BooleanField(default=False)
    instagram_provider = models.CharField(max_length=100, default='Meta', blank=True)
    
    # CRM settings
    crm_provider = models.CharField(max_length=100, default='SimplyBook.me')
    crm_connected = models.BooleanField(default=False)
    crm_api_key = models.CharField(max_length=255, blank=True, help_text='Encrypted in production')
    crm_last_synced = models.DateTimeField(null=True, blank=True)
    
    # Automation settings
    lead_followup_enabled = models.BooleanField(default=True)
    booking_reminder_enabled = models.BooleanField(default=True)
    confirmation_enabled = models.BooleanField(default=True)
    post_session_enabled = models.BooleanField(default=True)
    
    # Notification settings
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    in_app_notifications = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.user.email}"

