from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Avg, Q, Sum, F
from django.db.models.functions import TruncDate

from .models import BusinessInsight, PerformanceMetric, Opportunity
from .serializers import (
    BusinessInsightSerializer,
    PerformanceMetricSerializer,
    OpportunitySerializer
)
from leads.models import Lead
from ai_integration.models import AgentActivity
from messages.models import Message


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_insights(request):
    """Get all business insights for the current user"""
    insights = BusinessInsight.objects.filter(user=request.user)
    
    # Filter by type if provided
    insight_type = request.query_params.get('type')
    if insight_type:
        insights = insights.filter(type=insight_type)
    
    # Filter by resolved status
    is_resolved = request.query_params.get('is_resolved')
    if is_resolved is not None:
        insights = insights.filter(is_resolved=is_resolved.lower() == 'true')
    
    # Filter by priority
    priority = request.query_params.get('priority')
    if priority:
        insights = insights.filter(priority=priority)
    
    serializer = BusinessInsightSerializer(insights, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_missed_opportunities(request):
    """Get missed opportunities based on agent activity analysis"""
    # Get leads that haven't been contacted in a while
    days_threshold = int(request.query_params.get('days', 7))
    cutoff_date = timezone.now() - timedelta(days=days_threshold)
    
    missed_leads = Lead.objects.filter(
        user=request.user,
        status__in=['new', 'contacted', 'qualified'],
        last_contacted__lt=cutoff_date
    ).exclude(
        last_contacted__isnull=True
    )
    
    opportunities = []
    for lead in missed_leads:
        days_since_contact = (timezone.now() - lead.last_contacted).days if lead.last_contacted else None
        
        # Check if insight already exists
        existing_insight = BusinessInsight.objects.filter(
            user=request.user,
            lead=lead,
            type='missed_opportunity',
            is_resolved=False
        ).first()
        
        if not existing_insight:
            insight = BusinessInsight.objects.create(
                user=request.user,
                type='missed_opportunity',
                title=f'Follow-up needed: {lead.name}',
                description=f'Lead {lead.name} hasn\'t been contacted in {days_since_contact} days. Risk of losing engagement.',
                priority='high' if days_since_contact and days_since_contact > 14 else 'medium',
                lead=lead,
                metric_value=days_since_contact,
                metric_label='Days since last contact',
                action_items=[
                    'Send follow-up message',
                    'Review lead status',
                    'Update CRM notes'
                ],
                metadata={
                    'lead_status': lead.status,
                    'days_since_contact': days_since_contact
                }
            )
            opportunities.append(insight)
        else:
            opportunities.append(existing_insight)
    
    serializer = BusinessInsightSerializer(opportunities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_upsell_potential(request):
    """Identify upsell opportunities based on lead engagement and status"""
    # Find qualified leads that are highly engaged
    qualified_leads = Lead.objects.filter(
        user=request.user,
        status='qualified'
    )
    
    upsell_opportunities = []
    for lead in qualified_leads:
        # Count messages and activities
        message_count = Message.objects.filter(lead=lead).count()
        activity_count = AgentActivity.objects.filter(lead=lead).count()
        
        # High engagement = potential upsell
        if message_count >= 3 and activity_count >= 2:
            # Check if opportunity already exists
            existing_opp = Opportunity.objects.filter(
                user=request.user,
                lead=lead,
                type='upsell',
                status__in=['identified', 'in_progress']
            ).first()
            
            if not existing_opp:
                # Calculate confidence based on engagement
                confidence = min(100, 50 + (message_count * 5) + (activity_count * 3))
                
                opportunity = Opportunity.objects.create(
                    user=request.user,
                    lead=lead,
                    type='upsell',
                    title=f'Upsell opportunity: {lead.name}',
                    description=f'{lead.name} has shown high engagement ({message_count} messages, {activity_count} activities). Consider offering premium services.',
                    confidence_score=confidence,
                    reasoning=f'High engagement metrics: {message_count} messages, {activity_count} activities',
                    metadata={
                        'message_count': message_count,
                        'activity_count': activity_count,
                        'lead_status': lead.status
                    }
                )
                upsell_opportunities.append(opportunity)
            else:
                upsell_opportunities.append(existing_opp)
    
    serializer = OpportunitySerializer(upsell_opportunities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_performance_metrics(request):
    """Calculate and return key performance indicators"""
    # Get date range (default: last 30 days)
    days = int(request.query_params.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    # Get user's leads and activities
    leads = Lead.objects.filter(user=request.user)
    activities = AgentActivity.objects.filter(user=request.user, timestamp__gte=start_date)
    messages = Message.objects.filter(user=request.user, timestamp__gte=start_date)
    
    # Calculate metrics
    total_leads = leads.count()
    converted_leads = leads.filter(status='converted').count()
    conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
    
    # Response rate (messages with replies)
    outbound_messages = messages.filter(direction='outbound').count()
    inbound_messages = messages.filter(direction='inbound').count()
    response_rate = (inbound_messages / outbound_messages * 100) if outbound_messages > 0 else 0
    
    # Engagement rate (leads with multiple interactions)
    engaged_leads = leads.annotate(
        activity_count=Count('activities')
    ).filter(activity_count__gte=2).count()
    engagement_rate = (engaged_leads / total_leads * 100) if total_leads > 0 else 0
    
    # Average response time (simplified - would need message timestamps)
    # For now, use dummy data
    avg_response_time = 2.5  # hours (dummy)
    
    # Lead velocity (new leads per day)
    new_leads = leads.filter(created_at__gte=start_date).count()
    lead_velocity = new_leads / days if days > 0 else 0
    
    metrics = {
        'conversion_rate': round(conversion_rate, 2),
        'response_rate': round(response_rate, 2),
        'engagement_rate': round(engagement_rate, 2),
        'average_response_time': round(avg_response_time, 2),
        'lead_velocity': round(lead_velocity, 2),
        'total_leads': total_leads,
        'converted_leads': converted_leads,
        'new_leads': new_leads,
        'period_start': start_date.isoformat(),
        'period_end': timezone.now().isoformat(),
    }
    
    return Response(metrics, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bi_dashboard(request):
    """Get comprehensive BI dashboard data"""
    days = int(request.query_params.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    # Debug: Print user info
    print(f"\n[BI Dashboard] User: {request.user.email} (ID: {request.user.id})")
    
    # Get all insights (don't filter by date for unresolved, show all unresolved)
    # Limit to recent insights for performance (max 50)
    all_insights = BusinessInsight.objects.filter(
        user=request.user,
        is_resolved=False
    ).order_by('-created_at')
    
    # Get recent insights for the list (within date range, limited to 10)
    recent_insights = all_insights.filter(created_at__gte=start_date)[:10]
    
    # Get all insights for count (limited to 50 for performance)
    insights = all_insights[:50]
    
    # Get opportunities (limit for performance)
    opportunities = Opportunity.objects.filter(
        user=request.user,
        status__in=['identified', 'in_progress']
    ).order_by('-created_at')[:20]  # Limit to 20 most recent
    
    # Get performance metrics (avoid select_related to prevent recursion issues with Python 3.13)
    leads = Lead.objects.filter(user=request.user)
    activities_queryset = AgentActivity.objects.filter(
        user=request.user, 
        timestamp__gte=start_date
    )
    
    # Get activities count before limiting
    activities_count = activities_queryset.count()
    
    # Limit activities for serialization (but use full queryset for counts)
    activities = activities_queryset[:1000]
    
    # Debug: Print counts
    print(f"[BI Dashboard] Leads: {leads.count()}, Activities: {activities_count}, Insights: {insights.count()}, Opportunities: {opportunities.count()}")
    
    # Calculate summary stats
    total_leads = leads.count()
    converted_leads = leads.filter(status='converted').count()
    qualified_leads = leads.filter(status='qualified').count()
    new_leads = leads.filter(status='new').count()
    
    # Activity breakdown (use full queryset, not limited)
    activity_by_type = activities_queryset.values('type').annotate(count=Count('id'))
    
    # Lead status distribution
    lead_status_dist = leads.values('status').annotate(count=Count('id'))
    
    # Recent insights by type
    insights_by_type = insights.values('type').annotate(count=Count('id'))
    
    try:
        # Serialize insights and opportunities safely
        # recent_insights is already limited to 10
        insights_data = BusinessInsightSerializer(list(recent_insights), many=True).data
        opportunities_data = OpportunitySerializer(list(opportunities), many=True).data
    except Exception as e:
        print(f"[BI Dashboard] Serialization error: {str(e)}")
        # Fallback to empty lists if serialization fails
        insights_data = []
        opportunities_data = []
    
    dashboard_data = {
        'summary': {
            'total_leads': total_leads,
            'converted_leads': converted_leads,
            'qualified_leads': qualified_leads,
            'new_leads': new_leads,
            'conversion_rate': round((converted_leads / total_leads * 100) if total_leads > 0 else 0, 2),
            'total_activities': activities_count,
            'active_opportunities': opportunities.count(),
            'unresolved_insights': insights.count(),
        },
        'insights': insights_data,
        'opportunities': opportunities_data,
        'activity_breakdown': list(activity_by_type),
        'lead_status_distribution': list(lead_status_dist),
        'insights_by_type': list(insights_by_type),
        'period': {
            'start': start_date.isoformat(),
            'end': timezone.now().isoformat(),
            'days': days
        }
    }
    
    print(f"[BI Dashboard] Returning data: {len(insights_data)} insights, {len(opportunities_data)} opportunities")
    print(f"[BI Dashboard] Summary: {dashboard_data['summary']}")
    return Response(dashboard_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_insight_resolved(request, insight_id):
    """Mark an insight as resolved"""
    try:
        insight = BusinessInsight.objects.get(id=insight_id, user=request.user)
        insight.is_resolved = True
        insight.save()
        serializer = BusinessInsightSerializer(insight)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except BusinessInsight.DoesNotExist:
        return Response({'error': 'Insight not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_opportunity_status(request, opportunity_id):
    """Update opportunity status"""
    try:
        opportunity = Opportunity.objects.get(id=opportunity_id, user=request.user)
        new_status = request.data.get('status')
        
        if new_status in dict(Opportunity.STATUS_CHOICES):
            opportunity.status = new_status
            if new_status == 'converted':
                opportunity.converted_at = timezone.now()
            opportunity.save()
            serializer = OpportunitySerializer(opportunity)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    except Opportunity.DoesNotExist:
        return Response({'error': 'Opportunity not found'}, status=status.HTTP_404_NOT_FOUND)
