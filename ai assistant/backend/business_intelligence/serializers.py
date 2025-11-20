from rest_framework import serializers
from .models import BusinessInsight, PerformanceMetric, Opportunity
from leads.serializers import LeadSerializer


class BusinessInsightSerializer(serializers.ModelSerializer):
    lead = LeadSerializer(read_only=True, allow_null=True)
    lead_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = BusinessInsight
        fields = [
            'id', 'type', 'title', 'description', 'priority',
            'lead', 'lead_id', 'metric_value', 'metric_label',
            'action_items', 'metadata', 'is_resolved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PerformanceMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetric
        fields = [
            'id', 'metric_type', 'value', 'period_start',
            'period_end', 'metadata', 'created_at'
        ]
        read_only_fields = ['created_at']


class OpportunitySerializer(serializers.ModelSerializer):
    lead = LeadSerializer(read_only=True, allow_null=True)
    lead_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Opportunity
        fields = [
            'id', 'lead', 'lead_id', 'type', 'status', 'title',
            'description', 'estimated_value', 'confidence_score',
            'reasoning', 'metadata', 'created_at', 'updated_at',
            'converted_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'converted_at']

