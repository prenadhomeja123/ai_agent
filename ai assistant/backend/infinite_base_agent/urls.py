"""
URL configuration for infinite_base_agent project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('leads.urls')),
    path('api/', include('messages.urls')),
    path('api/', include('automations.urls')),
    path('api/', include('ai_integration.urls')),
    path('api/', include('settings.urls')),
    path('api/bi/', include('business_intelligence.urls')),
    path('api/', include('bookings.urls')),
    path('api/', include('onboarding.urls')),
]

