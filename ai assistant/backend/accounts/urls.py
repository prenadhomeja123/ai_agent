from django.urls import path
from . import views

urlpatterns = [
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/send-otp', views.send_otp, name='send-otp'),
    path('auth/verify-otp', views.verify_otp, name='verify-otp'),
    path('auth/me', views.get_current_user, name='current_user'),
]

