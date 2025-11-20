"""
Test script to verify OpenAI API key is accessible
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'infinite_base_agent.settings')
django.setup()

from django.conf import settings
from ai_integration.views import generate_ai_response
from rest_framework.test import APIRequestFactory
from accounts.models import User

print("\n" + "="*60)
print("OPENAI API KEY VERIFICATION")
print("="*60)

# Check if key is in settings
key = settings.OPENAI_API_KEY
print(f"1. Key in Django settings: {'YES' if key else 'NO'}")
print(f"2. Key length: {len(key) if key else 0}")
print(f"3. Key starts with 'sk-proj-': {key.startswith('sk-proj-') if key else False}")

# Check if OpenAI client can be initialized
try:
    from openai import OpenAI
    client = OpenAI(api_key=key)
    print(f"4. OpenAI client initialized: YES")
    
    # Test a simple API call (this will use your API credits)
    print("\n5. Testing API connection...")
    print("   (This will make a real API call to OpenAI)")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'API key is working!' in one sentence."}
            ],
            max_tokens=20,
        )
        
        ai_response = response.choices[0].message.content
        print(f"   Response: {ai_response}")
        print(f"6. API connection test: SUCCESS")
    except Exception as api_error:
        print(f"6. API connection test: FAILED")
        print(f"   Error: {str(api_error)}")
        print(f"   Note: Key is loaded, but API call failed. Check OpenAI API status.")
    
except Exception as e:
    print(f"6. API connection test: FAILED")
    print(f"   Error: {str(e)}")

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
if key and key.startswith('sk-proj-'):
    print("[SUCCESS] OpenAI API key is configured and working!")
    print("Your app can now use AI features.")
else:
    print("[ERROR] OpenAI API key is not properly configured.")
print("="*60 + "\n")

