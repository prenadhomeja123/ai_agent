from rest_framework import serializers
from .models import Booking
from leads.serializers import LeadSerializer


class BookingSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    lead_email = serializers.CharField(source='lead.email', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'lead', 'lead_name', 'lead_email', 'title', 'description',
            'start_time', 'end_time', 'duration_minutes', 'status', 'location',
            'booking_type', 'property', 'revenue', 'external_id', 'external_source', 'crm_client_id',
            'reminder_sent', 'reminder_sent_at', 'followup_sent', 'followup_sent_at',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ('user', 'created_at', 'updated_at', 'reminder_sent', 'reminder_sent_at', 'followup_sent', 'followup_sent_at')

