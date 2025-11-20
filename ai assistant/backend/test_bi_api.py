"""
Test BI Dashboard API endpoint
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'infinite_base_agent.settings')
django.setup()

from accounts.models import User
from business_intelligence.views import get_bi_dashboard
from django.test import RequestFactory
from rest_framework.test import force_authenticate

# Get first user
user = User.objects.first()
if not user:
    print("No users found")
    exit()

print(f"Testing BI Dashboard for user: {user.email}\n")

# Create a test request
factory = RequestFactory()
request = factory.get('/api/bi/dashboard?days=30')
request.user = user

try:
    response = get_bi_dashboard(request)
    print(f"Response status: {response.status_code}")
    print(f"\nResponse data keys: {list(response.data.keys())}")
    print(f"\nSummary:")
    if 'summary' in response.data:
        for key, value in response.data['summary'].items():
            print(f"  {key}: {value}")
    print(f"\nInsights count: {len(response.data.get('insights', []))}")
    print(f"Opportunities count: {len(response.data.get('opportunities', []))}")
    print("\n✅ API endpoint is working!")
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
