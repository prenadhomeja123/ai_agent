"""
Booking API views
"""

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer
from leads.models import Lead
from settings.simplybook_service import SimplyBookService
from settings.models import UserSettings
from django.utils import timezone
from datetime import timedelta, datetime
import logging

logger = logging.getLogger(__name__)


class BookingListCreateView(generics.ListCreateAPIView):
    """List and create bookings"""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Use only() to limit fields and prevent recursion issues
        queryset = Booking.objects.filter(user=self.request.user).order_by('-start_time')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        # Limit to 100 most recent bookings for performance
        return queryset[:100]


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a booking"""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Avoid select_related to prevent recursion issues with Python 3.13
        return Booking.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Manually optimize the query for detail view
        obj = super().get_object()
        # Prefetch lead data if needed
        if hasattr(obj, 'lead'):
            # Access lead to ensure it's loaded
            _ = obj.lead.name
        return obj


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_availability(request):
    """Get available time slots from CRM/calendar"""
    try:
        settings = UserSettings.objects.get(user=request.user)
    except UserSettings.DoesNotExist:
        return Response({'error': 'Settings not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if not settings.crm_connected or not settings.crm_api_key:
        return Response({'error': 'CRM not connected'}, status=status.HTTP_400_BAD_REQUEST)
    
    service_id = request.query_params.get('service_id')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    try:
        if start_date:
            start_date = datetime.fromisoformat(start_date)
        else:
            start_date = timezone.now()
        
        if end_date:
            end_date = datetime.fromisoformat(end_date)
        else:
            end_date = start_date + timedelta(days=7)
    except Exception as e:
        return Response({'error': f'Invalid date format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    
    simplybook = SimplyBookService(
        api_key=settings.crm_api_key,
        company_login=None
    )
    
    availability = simplybook.get_availability(
        service_id=service_id,
        start_date=start_date,
        end_date=end_date
    )
    
    if availability is None:
        return Response({'error': 'Failed to fetch availability'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({'availability': availability}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reschedule_booking(request, booking_id):
    """Reschedule a booking"""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    new_start_time = request.data.get('start_time')
    new_end_time = request.data.get('end_time')
    
    if not new_start_time:
        return Response({'error': 'start_time is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from datetime import datetime
        if isinstance(new_start_time, str):
            booking.start_time = datetime.fromisoformat(new_start_time.replace('Z', '+00:00'))
        else:
            booking.start_time = new_start_time
        
        if new_end_time:
            if isinstance(new_end_time, str):
                booking.end_time = datetime.fromisoformat(new_end_time.replace('Z', '+00:00'))
            else:
                booking.end_time = new_end_time
        else:
            # Default to same duration
            duration = booking.end_time - booking.start_time
            booking.end_time = booking.start_time + duration
        
        booking.save()
        
        # Update in CRM if synced
        if booking.external_id:
            try:
                settings = UserSettings.objects.get(user=request.user)
                if settings.crm_connected and settings.crm_api_key:
                    simplybook = SimplyBookService(
                        api_key=settings.crm_api_key,
                        company_login=None
                    )
                    
                    booking_data = {
                        'start_time': booking.start_time.isoformat(),
                        'end_time': booking.end_time.isoformat(),
                    }
                    
                    result = simplybook.update_booking(booking.external_id, booking_data)
                    if result:
                        logger.info(f"Booking {booking_id} rescheduled in CRM")
            except Exception as e:
                logger.error(f"Error updating booking in CRM: {str(e)}")
        
        # Trigger reschedule automation
        from automations.services import trigger_automations
        trigger_automations('booking_rescheduled', {
            'user': request.user,
            'lead': booking.lead,
            'booking': booking
        })
        
        return Response({'success': True, 'booking': BookingSerializer(booking).data}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error rescheduling booking: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_no_show(request, booking_id):
    """Mark a booking as no-show"""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only mark as no-show if booking time has passed
    if booking.start_time > timezone.now():
        return Response({'error': 'Cannot mark as no-show before booking time'}, status=status.HTTP_400_BAD_REQUEST)
    
    booking.status = 'no_show'
    booking.save()
    
    # Trigger no-show automation (handled by signal)
    
    return Response({'success': True, 'booking': BookingSerializer(booking).data}, status=status.HTTP_200_OK)

