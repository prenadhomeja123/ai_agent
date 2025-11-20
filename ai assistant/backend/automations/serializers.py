from rest_framework import serializers
from .models import Automation


class AutomationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Automation
        fields = [
            'id', 'name', 'type', 'enabled', 'trigger', 'delay_hours', 'delay_days',
            'channel', 'message_template', 'conditions', 'last_triggered', 
            'times_triggered', 'created_at', 'updated_at'
        ]
        read_only_fields = ('user', 'created_at', 'updated_at', 'last_triggered', 'times_triggered')

