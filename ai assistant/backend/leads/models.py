from django.db import models
from accounts.models import User


class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]

    SERVICE_TYPE_CHOICES = [
        ('consultation', 'Consultation'),
        ('coaching', 'Coaching'),
        ('therapy', 'Therapy'),
        ('session', 'Session'),
        ('workshop', 'Workshop'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leads')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    source = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    # New fields for MVP/Demo
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES, blank=True, help_text='Type of service requested')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Price quoted or expected')
    description_of_enquiry = models.TextField(blank=True, help_text='Description of the enquiry or request')
    potential_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Potential revenue value of this lead')
    
    # CRM integration
    crm_client_id = models.CharField(max_length=255, blank=True, help_text='Client ID in CRM system (SimplyBook.me, etc.)')
    crm_synced_at = models.DateTimeField(null=True, blank=True, help_text='Last time synced to CRM')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_contacted = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email})"

