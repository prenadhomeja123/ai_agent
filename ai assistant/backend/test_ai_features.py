"""
Test script to verify AI features are working
Run: python test_ai_features.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'infinite_base_agent.settings')
django.setup()

from django.conf import settings
from django.test import Client
from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import json

print("\n" + "="*60)
print("AI FEATURES TEST")
print("="*60)

# Step 1: Check API Key
print("\n[Step 1] Checking OpenAI API Key...")
api_key = settings.OPENAI_API_KEY
if api_key and api_key.startswith('sk-proj-'):
    print("  [OK] API Key is configured")
    print(f"  Key length: {len(api_key)} characters")
else:
    print("  [ERROR] API Key is not configured!")
    print("  Please add OPENAI_API_KEY to .env file")
    exit(1)

# Step 2: Get or create test user
print("\n[Step 2] Getting test user...")
try:
    user = User.objects.get(email='test@example.com')
    print(f"  [OK] Test user found: {user.email}")
except User.DoesNotExist:
    print("  [ERROR] Test user not found!")
    print("  Run: python create_test_user.py")
    exit(1)

# Step 3: Generate JWT token
print("\n[Step 3] Generating authentication token...")
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)
print("  [OK] Token generated")

# Step 4: Test AI endpoint directly (without HTTP)
print("\n[Step 4] Testing AI functionality directly...")
print("  Testing OpenAI API call...")

try:
    from openai import OpenAI
    from ai_integration.views import generate_ai_response
    from rest_framework.test import APIRequestFactory
    from rest_framework.request import Request
    
    # Check if API key is available
    if not settings.OPENAI_API_KEY:
        print("  [ERROR] API key not found in settings!")
    else:
        # Initialize OpenAI client to test connection
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        print("  [OK] OpenAI client initialized")
        
        # Test with a simple prompt
        print("  Making test API call to OpenAI...")
        print("  (This will use your API credits)")
        
        test_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'AI is working!' in one sentence."}
            ],
            max_tokens=20,
        )
        
        ai_text = test_response.choices[0].message.content
        print("  [SUCCESS] OpenAI API is working!")
        print(f"\n  AI Response: {ai_text}")
        
        # Test the Django view
        print("\n  Testing Django AI endpoint view...")
        factory = APIRequestFactory()
        request = factory.post(
            '/api/ai/generate',
            {'prompt': 'Say hello', 'context': {}},
            format='json'
        )
        request.user = user
        
        view_response = generate_ai_response(request)
        
        if view_response.status_code == 200:
            result = view_response.data
            print("  [SUCCESS] Django AI endpoint is working!")
            print(f"  Generated response: {result.get('response', '')[:100]}...")
            
            # Check activity
            from ai_integration.models import AgentActivity
            activities = AgentActivity.objects.filter(user=user).order_by('-timestamp')
            if activities.exists():
                print(f"\n  [OK] Activity logged: {activities.count()} total")
            else:
                print(f"\n  [WARNING] No activity logged")
        else:
            print(f"  [ERROR] View returned status {view_response.status_code}")
            print(f"  Error: {view_response.data}")
            
except ImportError as e:
    print(f"  [ERROR] Missing package: {str(e)}")
    print("  Install: pip install openai")
except Exception as e:
    print(f"  [ERROR] {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
print("TEST SUMMARY")
print("="*60)
print("If you see '[SUCCESS] OpenAI API is working!' above,")
print("then your AI features are fully functional!")
print("\nTo test via HTTP API, use Postman or see HOW_TO_TEST_AI.md")
print("="*60 + "\n")

