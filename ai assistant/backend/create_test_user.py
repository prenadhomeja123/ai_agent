"""
Script to create a test user for sign-in testing
Run: python create_test_user.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'infinite_base_agent.settings')
django.setup()

from accounts.models import User

# Test user credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123456"
TEST_NAME = "Test User"

# Check if user already exists
if User.objects.filter(email=TEST_EMAIL).exists():
    user = User.objects.get(email=TEST_EMAIL)
    print(f"User already exists: {user.email}")
    print(f"Resetting password...")
    user.set_password(TEST_PASSWORD)
    user.save()
    print(f"[SUCCESS] Password reset successfully!")
else:
    # Create new user
    user = User.objects.create_user(
        username=TEST_EMAIL,
        email=TEST_EMAIL,
        password=TEST_PASSWORD,
        first_name="Test",
        last_name="User",
        email_verified=False  # Not verified yet - will need OTP
    )
    print(f"[SUCCESS] Test user created successfully!")

print("\n" + "="*60)
print("TEST USER CREDENTIALS:")
print("="*60)
print(f"Email: {TEST_EMAIL}")
print(f"Password: {TEST_PASSWORD}")
print(f"Name: {TEST_NAME}")
print(f"Email Verified: {user.email_verified}")
print("="*60)
print("\nYou can now:")
print("1. Sign in with these credentials")
print("2. Send OTP to verify email")
print("3. Verify OTP to complete registration")
print("="*60 + "\n")

