import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'infinite_base_agent.settings')
django.setup()

from accounts.models import User
from leads.models import Lead
from ai_integration.models import AgentActivity
from business_intelligence.models import BusinessInsight, Opportunity
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count

user = User.objects.first()
start_date = timezone.now() - timedelta(days=30)

print('='*60)
print('BI DASHBOARD DATA CHECK')
print('='*60)
print(f'User: {user.email}')
print(f'Date range: Last 30 days (from {start_date.date()})')
print()

print('=== LEADS ===')
total_leads = Lead.objects.filter(user=user).count()
converted_leads = Lead.objects.filter(user=user, status='converted').count()
print(f'Total: {total_leads}')
print(f'Converted: {converted_leads}')
print(f'Conversion Rate: {(converted_leads/total_leads*100) if total_leads > 0 else 0:.2f}%')
print()

print('=== ACTIVITIES (last 30 days) ===')
activities = AgentActivity.objects.filter(user=user, timestamp__gte=start_date)
print(f'Total: {activities.count()}')
print(f'All time: {AgentActivity.objects.filter(user=user).count()}')
print()

print('=== INSIGHTS ===')
all_insights = BusinessInsight.objects.filter(user=user)
unresolved_insights = BusinessInsight.objects.filter(user=user, created_at__gte=start_date, is_resolved=False)
print(f'Total: {all_insights.count()}')
print(f'Resolved: {all_insights.filter(is_resolved=True).count()}')
print(f'Unresolved (last 30 days): {unresolved_insights.count()}')
print(f'Unresolved (all time): {all_insights.filter(is_resolved=False).count()}')
print()

print('=== OPPORTUNITIES ===')
all_opps = Opportunity.objects.filter(user=user)
active_opps = Opportunity.objects.filter(user=user, status__in=['identified', 'in_progress'])
print(f'Total: {all_opps.count()}')
print(f'Active (identified/in_progress): {active_opps.count()}')
print(f'Status breakdown:')
for item in all_opps.values('status').annotate(count=Count('id')):
    print(f'  {item["status"]}: {item["count"]}')
print()

print('='*60)

