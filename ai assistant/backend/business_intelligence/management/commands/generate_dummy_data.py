"""
Django management command to generate dummy CRM data for testing Business Intelligence features.
Run this command to populate the database with sample leads, activities, and messages.

Usage:
    python manage.py generate_dummy_data [user_email]
"""

from django.core.management.base import BaseCommand
from datetime import timedelta
from django.utils import timezone
from random import choice, randint, uniform

from accounts.models import User
from leads.models import Lead
from ai_integration.models import AgentActivity
from messages.models import Message
from business_intelligence.models import BusinessInsight, Opportunity, PerformanceMetric


class Command(BaseCommand):
    help = 'Generate dummy CRM data for testing Business Intelligence features'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email of the user to generate data for (optional)',
        )

    def handle(self, *args, **options):
        user_email = options.get('user_email')
        
        # Get or create a test user
        if user_email:
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"User with email {user_email} not found. Please create the user first."))
                return
        else:
            # Get the first user or create one
            user = User.objects.first()
            if not user:
                self.stdout.write(self.style.ERROR("No users found. Please create a user first."))
                return
        
        self.stdout.write(self.style.SUCCESS(f"\nGenerating dummy data for user: {user.email}\n"))
        
        # Lead statuses and sources
        lead_statuses = ['new', 'contacted', 'qualified', 'converted', 'lost']
        lead_sources = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Trade Show', 'Cold Call']
        lead_names = [
            'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson', 'Lisa Anderson',
            'Robert Brown', 'Jennifer Martinez', 'James Taylor', 'Patricia White', 'Michael Harris',
            'Linda Thompson', 'William Garcia', 'Barbara Martinez', 'Richard Robinson', 'Susan Clark',
            'Joseph Rodriguez', 'Jessica Lewis', 'Thomas Lee', 'Karen Walker', 'Christopher Hall'
        ]
        
        # Generate Leads
        self.stdout.write("Generating leads...")
        leads = []
        for i, name in enumerate(lead_names):
            email = name.lower().replace(' ', '.') + '@example.com'
            lead, created = Lead.objects.get_or_create(
                user=user,
                email=email,
                defaults={
                    'name': name,
                    'phone': f'+1-555-{randint(100, 999)}-{randint(1000, 9999)}',
                    'status': choice(lead_statuses),
                    'source': choice(lead_sources),
                    'notes': f'Dummy lead data for testing BI features. Lead #{i+1}',
                    'last_contacted': timezone.now() - timedelta(days=randint(0, 30)),
                }
            )
            leads.append(lead)
            if created:
                self.stdout.write(f"  Created lead: {lead.name} ({lead.status})")
        
        self.stdout.write(self.style.SUCCESS(f"Total leads: {len(leads)}\n"))
        
        # Generate Agent Activities
        self.stdout.write("Generating agent activities...")
        activity_types = ['message_sent', 'message_replied', 'followup_triggered', 'crm_updated', 'automation_ran']
        channels = ['email', 'sms', 'whatsapp', 'facebook', 'instagram']
        
        activities_created = 0
        for i in range(50):  # Generate 50 activities
            lead = choice(leads)
            activity_type = choice(activity_types)
            channel = choice(channels) if activity_type in ['message_sent', 'message_replied'] else None
            
            activity = AgentActivity.objects.create(
                user=user,
                type=activity_type,
                description=f'Dummy {activity_type.replace("_", " ")} for {lead.name}',
                channel=channel,
                lead=lead,
                details={
                    'dummy': True,
                    'test_data': True,
                },
                timestamp=timezone.now() - timedelta(days=randint(0, 30), hours=randint(0, 23))
            )
            activities_created += 1
        
        self.stdout.write(self.style.SUCCESS(f"Created {activities_created} activities\n"))
        
        # Generate Messages
        self.stdout.write("Generating messages...")
        directions = ['inbound', 'outbound']
        message_statuses = ['sent', 'delivered', 'read']
        
        messages_created = 0
        for i in range(30):  # Generate 30 messages
            lead = choice(leads)
            direction = choice(directions)
            channel = choice(channels)
            
            message = Message.objects.create(
                user=user,
                lead=lead,
                channel=channel,
                direction=direction,
                content=f'Dummy {direction} message content for testing. This is message #{i+1}',
                status=choice(message_statuses),
                ai_generated=direction == 'outbound' and randint(0, 1) == 1,
                timestamp=timezone.now() - timedelta(days=randint(0, 30), hours=randint(0, 23))
            )
            messages_created += 1
        
        self.stdout.write(self.style.SUCCESS(f"Created {messages_created} messages\n"))
        
        # Generate Business Insights
        self.stdout.write("Generating business insights...")
        insight_types = ['missed_opportunity', 'upsell_potential', 'conversion_risk', 'engagement_trend', 'performance_metric']
        priorities = ['high', 'medium', 'low']
        
        insights_created = 0
        for i in range(10):  # Generate 10 insights
            lead = choice(leads) if randint(0, 1) == 1 else None
            insight_type = choice(insight_types)
            priority = choice(priorities)
            
            insight = BusinessInsight.objects.create(
                user=user,
                type=insight_type,
                title=f'Dummy {insight_type.replace("_", " ").title()} Insight #{i+1}',
                description=f'This is a dummy insight for testing BI features. Type: {insight_type}, Priority: {priority}',
                priority=priority,
                lead=lead,
                metric_value=uniform(0, 100) if randint(0, 1) == 1 else None,
                metric_label='Test Metric' if randint(0, 1) == 1 else '',
                action_items=[
                    'Review lead status',
                    'Send follow-up message',
                    'Update CRM notes'
                ],
                metadata={'dummy': True, 'test_data': True},
                is_resolved=randint(0, 1) == 1
            )
            insights_created += 1
        
        self.stdout.write(self.style.SUCCESS(f"Created {insights_created} insights\n"))
        
        # Generate Opportunities
        self.stdout.write("Generating opportunities...")
        opportunity_types = ['upsell', 'cross_sell', 'renewal', 'expansion', 'win_back']
        opp_statuses = ['identified', 'in_progress', 'converted', 'lost']
        
        opportunities_created = 0
        for i in range(8):  # Generate 8 opportunities
            lead = choice([l for l in leads if l.status in ['qualified', 'contacted']])
            opp_type = choice(opportunity_types)
            status = choice(opp_statuses)
            
            opportunity = Opportunity.objects.create(
                user=user,
                lead=lead,
                type=opp_type,
                status=status,
                title=f'Dummy {opp_type.replace("_", " ").title()} Opportunity for {lead.name}',
                description=f'This is a dummy {opp_type} opportunity for testing BI features.',
                estimated_value=uniform(100, 10000) if randint(0, 1) == 1 else None,
                confidence_score=randint(40, 95),
                reasoning=f'High engagement metrics and positive interactions with {lead.name}',
                metadata={'dummy': True, 'test_data': True},
                converted_at=timezone.now() - timedelta(days=randint(0, 10)) if status == 'converted' else None
            )
            opportunities_created += 1
        
        self.stdout.write(self.style.SUCCESS(f"Created {opportunities_created} opportunities\n"))
        
        # Generate Performance Metrics
        self.stdout.write("Generating performance metrics...")
        metric_types = [
            'conversion_rate', 'response_rate', 'engagement_rate',
            'average_response_time', 'lead_velocity', 'revenue_per_lead', 'upsell_rate'
        ]
        
        metrics_created = 0
        for i in range(7):  # Generate metrics for last 7 days
            metric_type = choice(metric_types)
            period_end = timezone.now() - timedelta(days=i)
            period_start = period_end - timedelta(days=1)
            
            # Generate realistic metric values
            if metric_type == 'conversion_rate':
                value = uniform(5, 25)  # 5-25%
            elif metric_type == 'response_rate':
                value = uniform(30, 70)  # 30-70%
            elif metric_type == 'engagement_rate':
                value = uniform(40, 80)  # 40-80%
            elif metric_type == 'average_response_time':
                value = uniform(1, 6)  # 1-6 hours
            elif metric_type == 'lead_velocity':
                value = uniform(2, 10)  # 2-10 leads per day
            elif metric_type == 'revenue_per_lead':
                value = uniform(100, 500)  # $100-$500
            else:  # upsell_rate
                value = uniform(10, 30)  # 10-30%
            
            metric = PerformanceMetric.objects.create(
                user=user,
                metric_type=metric_type,
                value=value,
                period_start=period_start,
                period_end=period_end,
                metadata={'dummy': True, 'test_data': True}
            )
            metrics_created += 1
        
        self.stdout.write(self.style.SUCCESS(f"Created {metrics_created} performance metrics\n"))
        
        self.stdout.write(self.style.SUCCESS("="*60))
        self.stdout.write(self.style.SUCCESS("Dummy data generation complete!"))
        self.stdout.write(self.style.SUCCESS("="*60))
        self.stdout.write(f"\nSummary:")
        self.stdout.write(f"  - Leads: {len(leads)}")
        self.stdout.write(f"  - Activities: {activities_created}")
        self.stdout.write(f"  - Messages: {messages_created}")
        self.stdout.write(f"  - Insights: {insights_created}")
        self.stdout.write(f"  - Opportunities: {opportunities_created}")
        self.stdout.write(f"  - Performance Metrics: {metrics_created}")
        self.stdout.write(self.style.SUCCESS(f"\nYou can now test the BI dashboard at /insights"))
        self.stdout.write(self.style.SUCCESS("="*60))

