from django.contrib import admin
from .models import BusinessInsight, PerformanceMetric, Opportunity


@admin.register(BusinessInsight)
class BusinessInsightAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'priority', 'user', 'lead', 'is_resolved', 'created_at']
    list_filter = ['type', 'priority', 'is_resolved', 'created_at']
    search_fields = ['title', 'description', 'user__email', 'lead__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PerformanceMetric)
class PerformanceMetricAdmin(admin.ModelAdmin):
    list_display = ['metric_type', 'value', 'user', 'period_start', 'period_end', 'created_at']
    list_filter = ['metric_type', 'period_end', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at']


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'status', 'lead', 'confidence_score', 'user', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['title', 'description', 'lead__name', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'converted_at']
