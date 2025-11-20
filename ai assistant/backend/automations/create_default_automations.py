"""
Script to create default automations for a user
Run this to set up common automations

Usage:
    python manage.py shell
    >>> exec(open('automations/create_default_automations.py').read())
    >>> create_default_automations('user@example.com')
"""

from accounts.models import User
from automations.models import Automation


def create_default_automations(user_email):
    """Create default automations for a user"""
    try:
        user = User.objects.get(email=user_email)
    except User.DoesNotExist:
        print(f"User {user_email} not found")
        return
    
    automations = [
        {
            'name': 'Welcome New Leads',
            'type': 'lead_followup',
            'trigger': 'new_lead',
            'delay_hours': 0,
            'delay_days': 0,
            'channel': 'email',
            'message_template': '',
            'conditions': {}
        },
        {
            'name': 'Follow-up After 3 Days',
            'type': 'lead_followup',
            'trigger': 'no_contact_days',
            'delay_hours': 0,
            'delay_days': 3,
            'channel': 'email',
            'message_template': '',
            'conditions': {}
        },
        {
            'name': 'Follow-up After 7 Days',
            'type': 'lead_followup',
            'trigger': 'no_contact_days',
            'delay_hours': 0,
            'delay_days': 7,
            'channel': 'email',
            'message_template': '',
            'conditions': {}
        },
        {
            'name': 'Booking Reminder 24h Before',
            'type': 'booking_reminder',
            'trigger': 'booking_reminder_hours',
            'delay_hours': 24,
            'delay_days': 0,
            'channel': 'email',
            'message_template': '',
            'conditions': {}
        },
    ]
    
    created_count = 0
    for auto_data in automations:
        automation, created = Automation.objects.get_or_create(
            user=user,
            name=auto_data['name'],
            defaults=auto_data
        )
        if created:
            created_count += 1
            print(f"Created automation: {automation.name}")
        else:
            print(f"Automation already exists: {automation.name}")
    
    print(f"\nCreated {created_count} new automations for {user.email}")

