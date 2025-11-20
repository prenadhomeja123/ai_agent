from django.db import models
from django.utils import timezone
from accounts.models import User
from leads.models import Lead
from ai_integration.models import AgentActivity


class BusinessInsight(models.Model):
    """Stores generated business insights based on agent activities"""
    INSIGHT_TYPE_CHOICES = [
        ('missed_opportunity', 'Missed Opportunity'),
        ('upsell_potential', 'Upsell Potential'),
        ('conversion_risk', 'Conversion Risk'),
        ('engagement_trend', 'Engagement Trend'),
        ('performance_metric', 'Performance Metric'),
        ('recommendation', 'Recommendation'),
    ]

    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='insights')
    type = models.CharField(max_length=50, choices=INSIGHT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='insights')
    metric_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    metric_label = models.CharField(max_length=100, blank=True)
    action_items = models.JSONField(default=list, blank=True)  # List of recommended actions
    metadata = models.JSONField(default=dict, blank=True)  # Additional context data
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['user', 'type', 'is_resolved']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.type} - {self.title}"


class PerformanceMetric(models.Model):
    """Tracks key performance indicators over time"""
    METRIC_TYPE_CHOICES = [
        ('conversion_rate', 'Conversion Rate'),
        ('response_rate', 'Response Rate'),
        ('engagement_rate', 'Engagement Rate'),
        ('average_response_time', 'Average Response Time'),
        ('lead_velocity', 'Lead Velocity'),
        ('revenue_per_lead', 'Revenue Per Lead'),
        ('upsell_rate', 'Upsell Rate'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='metrics')
    metric_type = models.CharField(max_length=50, choices=METRIC_TYPE_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-period_end', '-created_at']
        indexes = [
            models.Index(fields=['user', 'metric_type', 'period_end']),
        ]

    def __str__(self):
        return f"{self.metric_type}: {self.value} ({self.period_start.date()} - {self.period_end.date()})"


class Opportunity(models.Model):
    """Tracks potential business opportunities identified by the system"""
    OPPORTUNITY_TYPE_CHOICES = [
        ('upsell', 'Upsell'),
        ('cross_sell', 'Cross-sell'),
        ('renewal', 'Renewal'),
        ('expansion', 'Expansion'),
        ('win_back', 'Win-back'),
    ]

    STATUS_CHOICES = [
        ('identified', 'Identified'),
        ('in_progress', 'In Progress'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='opportunities')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='opportunities')
    type = models.CharField(max_length=50, choices=OPPORTUNITY_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='identified')
    title = models.CharField(max_length=255)
    description = models.TextField()
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    confidence_score = models.IntegerField(default=50)  # 0-100
    reasoning = models.TextField(blank=True)  # Why this opportunity was identified
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    converted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-confidence_score', '-created_at']
        verbose_name_plural = 'Opportunities'

    def __str__(self):
        return f"{self.type} - {self.lead.name} ({self.status})"
