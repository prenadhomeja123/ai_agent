from rest_framework import serializers
from .models import OnboardingStep


class OnboardingStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingStep
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at', 'setup_completed_at')

