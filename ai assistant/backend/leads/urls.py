from django.urls import path
from . import views

urlpatterns = [
    path('leads', views.LeadListCreateView.as_view(), name='lead-list'),
    path('leads/stats', views.lead_stats, name='lead-stats'),
    path('leads/<int:pk>', views.lead_detail, name='lead-detail'),
]

