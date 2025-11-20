"""
Calendar Integration Service
Handles calendar operations (Google Calendar, Outlook, etc.)
"""

import logging
from django.conf import settings
from datetime import datetime, timedelta
import requests

logger = logging.getLogger(__name__)


class CalendarService:
    """Service for calendar integration"""
    
    def __init__(self, user, provider='google'):
        """
        Initialize calendar service
        
        Args:
            user: Django User instance
            provider: Calendar provider ('google', 'outlook', 'ical')
        """
        self.user = user
        self.provider = provider
        self.access_token = None
    
    def _get_google_calendar_token(self):
        """Get Google Calendar access token from user settings"""
        # This would be stored in UserSettings or OnboardingStep
        # For now, return None (needs implementation)
        return None
    
    def add_booking_to_calendar(self, booking):
        """
        Add a booking to the user's calendar
        
        Args:
            booking: Booking model instance
            
        Returns:
            Tuple of (success: bool, event_id: str or None, error: str or None)
        """
        try:
            if self.provider == 'google':
                return self._add_to_google_calendar(booking)
            elif self.provider == 'outlook':
                return self._add_to_outlook_calendar(booking)
            elif self.provider == 'ical':
                return self._add_to_ical(booking)
            else:
                return (False, None, f"Unsupported calendar provider: {self.provider}")
        except Exception as e:
            logger.error(f"Calendar service error: {str(e)}")
            return (False, None, str(e))
    
    def _add_to_google_calendar(self, booking):
        """Add booking to Google Calendar"""
        try:
            access_token = self._get_google_calendar_token()
            if not access_token:
                return (False, None, "Google Calendar not connected. Please connect in settings.")
            
            # Google Calendar API endpoint
            url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
            
            # Format booking as calendar event
            event_data = {
                'summary': booking.title or f"Session with {booking.lead.name}",
                'description': booking.description or f"Booking for {booking.lead.name}",
                'start': {
                    'dateTime': booking.start_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': booking.end_time.isoformat(),
                    'timeZone': 'UTC',
                },
            }
            
            if booking.location:
                event_data['location'] = booking.location
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
            }
            
            response = requests.post(url, headers=headers, json=event_data, timeout=10)
            
            if response.status_code == 200:
                event = response.json()
                event_id = event.get('id')
                return (True, event_id, None)
            else:
                logger.error(f"Google Calendar API error: {response.status_code} - {response.text}")
                return (False, None, f"Failed to add to Google Calendar: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Google Calendar error: {str(e)}")
            return (False, None, str(e))
    
    def _add_to_outlook_calendar(self, booking):
        """Add booking to Outlook Calendar"""
        try:
            # Outlook Calendar API implementation
            # Similar to Google Calendar but using Microsoft Graph API
            return (False, None, "Outlook Calendar integration not yet implemented")
        except Exception as e:
            logger.error(f"Outlook Calendar error: {str(e)}")
            return (False, None, str(e))
    
    def _add_to_ical(self, booking):
        """Generate iCal file for booking"""
        try:
            # Import Python's built-in calendar module with alias
            import calendar as cal_module
            from datetime import datetime
            
            # Generate iCal format
            ical_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Infinite Base Agent//EN
BEGIN:VEVENT
UID:{booking.id}@infinitebaseagent.com
DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}
DTSTART:{booking.start_time.strftime('%Y%m%dT%H%M%SZ')}
DTEND:{booking.end_time.strftime('%Y%m%dT%H%M%SZ')}
SUMMARY:{booking.title or f"Session with {booking.lead.name}"}
DESCRIPTION:{booking.description or ''}
LOCATION:{booking.location or ''}
END:VEVENT
END:VCALENDAR"""
            
            return (True, ical_content, None)
        except Exception as e:
            logger.error(f"iCal generation error: {str(e)}")
            return (False, None, str(e))
    
    def get_availability(self, start_date, end_date):
        """
        Get available time slots from calendar
        
        Args:
            start_date: Start date for availability check
            end_date: End date for availability check
            
        Returns:
            List of available time slots or None if error
        """
        try:
            if self.provider == 'google':
                return self._get_google_availability(start_date, end_date)
            else:
                return None
        except Exception as e:
            logger.error(f"Get availability error: {str(e)}")
            return None
    
    def _get_google_availability(self, start_date, end_date):
        """Get availability from Google Calendar"""
        try:
            access_token = self._get_google_calendar_token()
            if not access_token:
                return None
            
            # Use Google Calendar Freebusy API
            url = "https://www.googleapis.com/calendar/v3/freeBusy"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
            }
            
            data = {
                'timeMin': start_date.isoformat(),
                'timeMax': end_date.isoformat(),
                'items': [{'id': 'primary'}]
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                # Parse busy times and return available slots
                # This is a simplified version - full implementation would calculate available slots
                return result.get('calendars', {}).get('primary', {}).get('busy', [])
            else:
                logger.error(f"Google Calendar Freebusy API error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Google Calendar availability error: {str(e)}")
            return None
