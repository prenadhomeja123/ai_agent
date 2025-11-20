from django.contrib import admin
from .models import User, OTP


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'email_verified', 'created_at')
    list_filter = ('email_verified', 'created_at')
    search_fields = ('email', 'first_name', 'last_name')


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'purpose', 'is_used', 'created_at', 'expires_at')
    list_filter = ('is_used', 'purpose', 'created_at')
    search_fields = ('email', 'code')
    readonly_fields = ('created_at', 'expires_at')

