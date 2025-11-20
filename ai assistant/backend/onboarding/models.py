"""
Onboarding models for white-glove setup flow
"""

from django.db import models
from django.utils import timezone
from accounts.models import User


class OnboardingStep(models.Model):
    """Track onboarding progress for users"""
    
    STEP_CHOICES = [
        ('welcome', 'Welcome'),
        ('crm_connection', 'CRM Connection'),
        ('booking_setup', 'Booking Setup'),
        ('channels_setup', 'Channels Setup'),
        ('automations_setup', 'Automations Setup'),
        ('complete', 'Complete'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='onboarding')
    current_step = models.CharField(max_length=50, choices=STEP_CHOICES, default='welcome')
    completed_steps = models.JSONField(default=list, blank=True)
    
    # Credentials collected during onboarding
    crm_provider = models.CharField(max_length=100, blank=True)
    crm_api_key = models.CharField(max_length=255, blank=True)
    crm_company_login = models.CharField(max_length=255, blank=True)
    
    booking_provider = models.CharField(max_length=100, blank=True)
    booking_api_key = models.CharField(max_length=255, blank=True)
    
    email_provider = models.CharField(max_length=100, blank=True)
    email_smtp_host = models.CharField(max_length=255, blank=True)
    email_smtp_user = models.CharField(max_length=255, blank=True)
    email_smtp_password = models.CharField(max_length=255, blank=True)
    
    sms_provider = models.CharField(max_length=100, blank=True)
    sms_twilio_sid = models.CharField(max_length=255, blank=True)
    sms_twilio_token = models.CharField(max_length=255, blank=True)
    sms_twilio_phone = models.CharField(max_length=50, blank=True)
    
    whatsapp_provider = models.CharField(max_length=100, blank=True)
    whatsapp_twilio_sid = models.CharField(max_length=255, blank=True)
    whatsapp_twilio_token = models.CharField(max_length=255, blank=True)
    
    facebook_page_id = models.CharField(max_length=255, blank=True)
    facebook_access_token = models.CharField(max_length=500, blank=True)
    
    instagram_account_id = models.CharField(max_length=255, blank=True)
    instagram_access_token = models.CharField(max_length=500, blank=True)
    
    # Setup team notes
    setup_notes = models.TextField(blank=True)
    setup_completed_by = models.CharField(max_length=255, blank=True)
    setup_completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Onboarding Steps'
    
    def __str__(self):
        return f"Onboarding for {self.user.email} - {self.current_step}"
    
    def mark_step_complete(self, step):
        """Mark a step as completed"""
        if step not in self.completed_steps:
            self.completed_steps.append(step)
            self.save()
    
    def is_complete(self):
        """Check if onboarding is complete"""
        return self.current_step == 'complete'

