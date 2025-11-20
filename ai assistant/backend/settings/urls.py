from django.urls import path
from . import views

urlpatterns = [
    path('settings', views.user_settings, name='user-settings'),
    path('settings/sync-crm', views.sync_crm, name='sync-crm'),
]

