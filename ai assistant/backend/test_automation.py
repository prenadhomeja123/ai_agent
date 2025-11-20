"""
Quick test script to verify automations work
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'infinite_base_agent.settings')
django.setup()

from accounts.models import User
from leads.models import Lead
from automations.models import Automation
from automations.services import trigger_automations
from messages.models import Message

# Get first user
user = User.objects.first()
if not user:
    print("No users found")
    exit()

print(f"Testing automations for user: {user.email}\n")

# Check automations
automations = Automation.objects.filter(user=user, enabled=True)
print(f"Found {automations.count()} enabled automations:")
for auto in automations:
    print(f"  - {auto.name} (trigger: {auto.trigger}, type: {auto.type})")

# Create a test lead to trigger new_lead automation
print("\n" + "="*60)
print("Creating test lead to trigger automation...")
print("="*60)

test_lead = Lead.objects.create(
    user=user,
    name="Test Automation Lead",
    email="test.automation@example.com",
    phone="+1-555-123-4567",
    status="new",
    source="Test"
)

print(f"Created lead: {test_lead.name} (ID: {test_lead.id})")

# Check if messages were created (should be automatic via signals)
import time
time.sleep(1)  # Give signals time to process

messages = Message.objects.filter(lead=test_lead)
print(f"\nMessages created for this lead: {messages.count()}")
for msg in messages:
    print(f"  - {msg.direction} {msg.channel}: {msg.content[:50]}...")

# Check activities
from ai_integration.models import AgentActivity
activities = AgentActivity.objects.filter(lead=test_lead, type='automation_ran')
print(f"\nAutomation activities logged: {activities.count()}")
for activity in activities:
    print(f"  - {activity.description}")

print("\n" + "="*60)
print("Test complete!")
print("="*60)
print("\nIf you see messages and activities above, automations are working!")
print("Note: Messages are created but not actually sent yet (messaging integration pending)")

