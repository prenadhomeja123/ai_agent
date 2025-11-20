from django.urls import path
from . import views

urlpatterns = [
    path('automations', views.AutomationListCreateView.as_view(), name='automation-list'),
    path('automations/<int:pk>', views.toggle_automation, name='automation-toggle'),
    path('automations/<int:pk>/test', views.test_automation, name='automation-test'),
    path('automations/trigger', views.trigger_manual_automation, name='automation-trigger'),
]

