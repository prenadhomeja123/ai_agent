from django.contrib.auth.models import AbstractUser
from django.db import models
import random
import string
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Override email field to make it unique and required
    email = models.EmailField(unique=True, blank=False, null=False)

    def __str__(self):
        return self.email


class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    email = models.EmailField()
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, default='verification')  # verification, login
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.email}"

    @staticmethod
    def generate_code():
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def create_otp(user, email, purpose='verification'):
        # Delete old unused OTPs for this user
        OTP.objects.filter(user=user, email=email, is_used=False).delete()
        
        code = OTP.generate_code()
        expires_at = timezone.now() + timedelta(minutes=10)  # OTP expires in 10 minutes
        
        otp = OTP.objects.create(
            user=user,
            email=email,
            code=code,
            purpose=purpose,
            expires_at=expires_at
        )
        return otp

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    def mark_as_used(self):
        self.is_used = True
        self.save()
