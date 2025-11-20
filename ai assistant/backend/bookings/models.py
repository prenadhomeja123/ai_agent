"""
Booking models for storing appointments and sessions
"""

from django.db import models
from django.utils import timezone
from accounts.models import User
from leads.models import Lead


class Booking(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='bookings')
    
    # Booking details
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Location/Type
    location = models.CharField(max_length=255, blank=True, help_text='Physical location or video link')
    booking_type = models.CharField(max_length=100, blank=True, help_text='Type of session/meeting')
    
    # New fields for MVP/Demo
    property = models.CharField(max_length=255, blank=True, help_text='Property name or address for the booking')
    revenue = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Revenue generated from this booking')
    
    # External references
    external_id = models.CharField(max_length=255, blank=True, help_text='ID from SimplyBook.me or other system')
    external_source = models.CharField(max_length=100, default='SimplyBook.me', help_text='Source system')
    crm_client_id = models.CharField(max_length=255, blank=True, help_text='Client ID in CRM system')
    
    # Reminders and follow-ups
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    followup_sent = models.BooleanField(default=False)
    followup_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']
        verbose_name_plural = 'Bookings'
    
    def __str__(self):
        return f"{self.title} - {self.lead.name} ({self.start_time})"
    
    def is_upcoming(self):
        """Check if booking is in the future"""
        return self.start_time > timezone.now()
    
    def is_past(self):
        """Check if booking is in the past"""
        return self.end_time < timezone.now()
    
    def hours_until(self):
        """Get hours until booking starts"""
        if self.is_past():
            return None
        delta = self.start_time - timezone.now()
        return delta.total_seconds() / 3600

