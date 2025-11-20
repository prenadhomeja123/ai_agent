from rest_framework import serializers
from .models import UserSettings


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
        extra_kwargs = {
            'crm_api_key': {'write_only': True}  # Don't expose API key in GET by default
        }

