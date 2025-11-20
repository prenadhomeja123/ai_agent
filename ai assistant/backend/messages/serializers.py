from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    lead = serializers.IntegerField(source='lead.id', read_only=True)
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    lead_email = serializers.CharField(source='lead.email', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'lead', 'lead_name', 'lead_email', 'channel', 'direction', 'content', 'status', 'ai_generated', 'timestamp']
        read_only_fields = ('user', 'timestamp', 'lead', 'lead_name', 'lead_email')

