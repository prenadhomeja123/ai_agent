from django.urls import path
from . import views

urlpatterns = [
    path('insights', views.get_insights, name='get_insights'),
    path('insights/missed-opportunities', views.get_missed_opportunities, name='missed_opportunities'),
    path('insights/upsell-potential', views.get_upsell_potential, name='upsell_potential'),
    path('metrics', views.get_performance_metrics, name='performance_metrics'),
    path('dashboard', views.get_bi_dashboard, name='bi_dashboard'),
    path('insights/<int:insight_id>/resolve', views.mark_insight_resolved, name='resolve_insight'),
    path('opportunities/<int:opportunity_id>/update-status', views.update_opportunity_status, name='update_opportunity_status'),
]

