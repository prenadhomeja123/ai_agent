from django.urls import path
from . import views

urlpatterns = [
    path('ai/generate', views.generate_ai_response, name='ai-generate'),
    path('activity', views.get_agent_activity, name='agent-activity'),
]

