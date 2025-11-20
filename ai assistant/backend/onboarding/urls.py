from django.urls import path
from . import views

urlpatterns = [
    path('onboarding', views.onboarding_status, name='onboarding-status'),
    path('onboarding/test-crm', views.test_crm_connection, name='onboarding-test-crm'),
]

