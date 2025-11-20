from django.urls import path
from . import views

urlpatterns = [
    path('bookings', views.BookingListCreateView.as_view(), name='booking-list'),
    path('bookings/<int:pk>', views.BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/availability', views.get_availability, name='booking-availability'),
    path('bookings/<int:booking_id>/reschedule', views.reschedule_booking, name='booking-reschedule'),
    path('bookings/<int:booking_id>/no-show', views.mark_no_show, name='booking-no-show'),
]

