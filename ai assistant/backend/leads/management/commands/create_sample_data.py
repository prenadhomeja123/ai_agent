"""
Django management command to create sample data for testing/demo
Usage: python manage.py create_sample_data
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import random

from accounts.models import User
from leads.models import Lead
from bookings.models import Booking
from messages.models import Message
from ai_integration.models import AgentActivity
from automations.models import Automation

SERVICE_TYPES = ['consultation', 'coaching', 'therapy', 'session', 'workshop', 'other']
LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost']
BOOKING_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']
CHANNELS = ['email', 'sms', 'whatsapp', 'facebook', 'instagram']
SAMPLE_NAMES = [
    'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Rodriguez', 'Jessica Martinez',
    'James Wilson', 'Lisa Anderson', 'Robert Taylor', 'Maria Garcia', 'John Smith',
    'Jennifer Brown', 'Michael Jones', 'Patricia Williams', 'William Moore', 'Linda Jackson',
    'Richard White', 'Barbara Harris', 'Joseph Martin', 'Susan Thompson', 'Thomas Garcia'
]
SAMPLE_EMAILS = [
    'sarah.johnson@email.com', 'mike.chen@email.com', 'emily.davis@email.com',
    'david.rodriguez@email.com', 'jessica.martinez@email.com', 'james.wilson@email.com',
    'lisa.anderson@email.com', 'robert.taylor@email.com', 'maria.garcia@email.com',
    'john.smith@email.com', 'jennifer.brown@email.com', 'michael.jones@email.com',
    'patricia.williams@email.com', 'william.moore@email.com', 'linda.jackson@email.com',
    'richard.white@email.com', 'barbara.harris@email.com', 'joseph.martin@email.com',
    'susan.thompson@email.com', 'thomas.garcia@email.com'
]
SAMPLE_PHONES = [
    '+1-555-0101', '+1-555-0102', '+1-555-0103', '+1-555-0104', '+1-555-0105',
    '+1-555-0106', '+1-555-0107', '+1-555-0108', '+1-555-0109', '+1-555-0110',
    '+1-555-0111', '+1-555-0112', '+1-555-0113', '+1-555-0114', '+1-555-0115',
    '+1-555-0116', '+1-555-0117', '+1-555-0118', '+1-555-0119', '+1-555-0120'
]
SOURCES = ['Website', 'Referral', 'Social Media', 'Google Ads', 'Facebook Ads', 'LinkedIn', 'Email Campaign']
ENQUIRY_DESCRIPTIONS = [
    'Interested in personal coaching sessions',
    'Looking for therapy services',
    'Want to book a consultation call',
    'Interested in group workshop',
    'Need help with business strategy',
    'Looking for life coaching',
    'Interested in wellness program',
    'Want to schedule initial assessment',
    'Looking for career guidance',
    'Interested in mindfulness training'
]
PROPERTIES = [
    'Downtown Office', 'Main Street Location', 'Virtual Session', 'Conference Room A',
    'Studio Space', 'Home Office', 'Co-working Space', 'Private Office', 'Meeting Room B'
]
BOOKING_TITLES = [
    'Initial Consultation', 'Follow-up Session', 'Coaching Session', 'Therapy Session',
    'Strategy Meeting', 'Assessment Call', 'Review Session', 'Progress Check',
    'Planning Session', 'Support Session'
]


class Command(BaseCommand):
    help = 'Create sample data for testing and demo purposes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--leads',
            type=int,
            default=20,
            help='Number of sample leads to create (default: 20)',
        )
        parser.add_argument(
            '--bookings',
            type=int,
            default=15,
            help='Number of sample bookings to create (default: 15)',
        )
        parser.add_argument(
            '--messages',
            type=int,
            default=30,
            help='Number of sample messages to create (default: 30)',
        )

    def handle(self, *args, **options):
        num_leads = options['leads']
        num_bookings = options['bookings']
        num_messages = options['messages']

        # Get or create a test user
        try:
            user = User.objects.first()
            if not user:
                self.stdout.write(self.style.ERROR('No user found. Please create a user first.'))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error getting user: {str(e)}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Creating sample data for user: {user.email}'))

        # Create Leads
        self.stdout.write('Creating sample leads...')
        leads_created = 0
        for i in range(num_leads):
            name = SAMPLE_NAMES[i % len(SAMPLE_NAMES)]
            email = SAMPLE_EMAILS[i % len(SAMPLE_EMAILS)]
            phone = SAMPLE_PHONES[i % len(SAMPLE_PHONES)]
            
            # Check if lead already exists
            if Lead.objects.filter(user=user, email=email).exists():
                continue
            
            lead = Lead.objects.create(
                user=user,
                name=name,
                email=email,
                phone=phone,
                status=random.choice(LEAD_STATUSES),
                source=random.choice(SOURCES),
                service_type=random.choice(SERVICE_TYPES),
                price=Decimal(str(random.randint(50, 500))),
                description_of_enquiry=random.choice(ENQUIRY_DESCRIPTIONS),
                potential_value=Decimal(str(random.randint(100, 1000))),
                notes=f'Sample lead #{i+1} created for testing purposes.',
                created_at=timezone.now() - timedelta(days=random.randint(0, 90)),
                last_contacted=timezone.now() - timedelta(days=random.randint(0, 30)) if random.random() > 0.3 else None,
            )
            leads_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {leads_created} leads'))

        # Get all leads for creating bookings and messages
        all_leads = list(Lead.objects.filter(user=user))

        if not all_leads:
            self.stdout.write(self.style.ERROR('No leads available. Cannot create bookings or messages.'))
            return

        # Create Bookings
        self.stdout.write('Creating sample bookings...')
        bookings_created = 0
        for i in range(num_bookings):
            lead = random.choice(all_leads)
            start_time = timezone.now() + timedelta(days=random.randint(-30, 30), hours=random.randint(9, 17))
            end_time = start_time + timedelta(hours=1)
            
            booking = Booking.objects.create(
                user=user,
                lead=lead,
                title=random.choice(BOOKING_TITLES),
                description=f'Sample booking for {lead.name}',
                start_time=start_time,
                end_time=end_time,
                duration_minutes=60,
                status=random.choice(BOOKING_STATUSES),
                location=random.choice(PROPERTIES) if random.random() > 0.3 else '',
                booking_type=random.choice(SERVICE_TYPES),
                property=random.choice(PROPERTIES) if random.random() > 0.5 else '',
                revenue=Decimal(str(random.randint(100, 500))) if random.random() > 0.4 else None,
                notes=f'Sample booking created for testing.',
            )
            bookings_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {bookings_created} bookings'))

        # Create Messages
        self.stdout.write('Creating sample messages...')
        messages_created = 0
        for i in range(num_messages):
            lead = random.choice(all_leads)
            channel = random.choice(CHANNELS)
            direction = random.choice(['inbound', 'outbound'])
            
            message_contents = {
                'outbound': [
                    f'Hi {lead.name}, thank you for your interest!',
                    f'Hello {lead.name}, I wanted to follow up on your enquiry.',
                    f'Hi {lead.name}, are you available for a call this week?',
                    f'Hello {lead.name}, I have some information that might help you.',
                ],
                'inbound': [
                    f'Hi, I\'m interested in learning more.',
                    f'Thanks for reaching out! When can we schedule?',
                    f'Yes, I\'d like to proceed with this.',
                    f'Can you send me more details?',
                ]
            }
            
            message = Message.objects.create(
                user=user,
                lead=lead,
                channel=channel,
                direction=direction,
                content=random.choice(message_contents[direction]),
                status=random.choice(['sent', 'delivered', 'read']),
                ai_generated=random.random() > 0.5 if direction == 'outbound' else False,
                timestamp=timezone.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23)),
            )
            messages_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {messages_created} messages'))

        # Create Agent Activities
        self.stdout.write('Creating sample agent activities...')
        activities_created = 0
        activity_types = ['message_sent', 'message_replied', 'followup_triggered', 'crm_updated', 'automation_ran']
        
        for i in range(min(20, len(all_leads))):
            lead = random.choice(all_leads)
            activity_type = random.choice(activity_types)
            
            descriptions = {
                'message_sent': f'Sent message to {lead.name} via {random.choice(CHANNELS)}',
                'message_replied': f'Replied to message from {lead.name}',
                'followup_triggered': f'Follow-up automation triggered for {lead.name}',
                'crm_updated': f'Updated CRM record for {lead.name}',
                'automation_ran': f'Automation executed for {lead.name}',
            }
            
            activity = AgentActivity.objects.create(
                user=user,
                lead=lead,
                type=activity_type,
                description=descriptions[activity_type],
                channel=random.choice(CHANNELS) if activity_type in ['message_sent', 'message_replied'] else None,
                timestamp=timezone.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23)),
                details={'sample': True, 'activity_id': i+1}
            )
            activities_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {activities_created} agent activities'))

        # Create Sample Automations (if they don't exist)
        self.stdout.write('Creating sample automations...')
        automation_types = [
            ('Lead Follow-up', 'lead_followup', 'Sends follow-up message 24 hours after lead creation'),
            ('Booking Reminder', 'booking_reminder', 'Sends reminder 1 hour before booking'),
            ('Post-Session Follow-up', 'post_session', 'Sends follow-up after completed booking'),
            ('No-Show Follow-up', 'no_show_followup', 'Sends message when booking marked as no-show'),
        ]
        
        automations_created = 0
        automation_triggers = {
            'lead_followup': 'new_lead',
            'booking_reminder': 'booking_reminder_hours',
            'post_session': 'session_completed',
            'no_show_followup': 'no_show',
        }
        
        for name, auto_type, description in automation_types:
            if not Automation.objects.filter(user=user, type=auto_type).exists():
                Automation.objects.create(
                    user=user,
                    name=name,
                    type=auto_type,
                    enabled=random.random() > 0.3,
                    trigger=automation_triggers.get(auto_type, 'new_lead'),
                    delay_hours=24 if 'followup' in auto_type else 1,
                    channel=random.choice(['email', 'sms']),
                    message_template=f'Sample {name} message template',
                )
                automations_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created/verified {automations_created} automations'))

        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('Sample Data Creation Complete!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(f'Leads: {leads_created}')
        self.stdout.write(f'Bookings: {bookings_created}')
        self.stdout.write(f'Messages: {messages_created}')
        self.stdout.write(f'Activities: {activities_created}')
        self.stdout.write(f'Automations: {automations_created}')
        self.stdout.write(self.style.SUCCESS('='*50))

