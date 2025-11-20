"""
SimplyBook.me API Integration Service
Handles fetching and syncing clients and bookings from SimplyBook.me
Includes two-way sync capabilities
"""

import requests
import logging
from django.utils import timezone
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SimplyBookService:
    """Service for interacting with SimplyBook.me API"""
    
    BASE_URL = "https://user-api.simplybook.me"
    
    def __init__(self, api_key, company_login=None):
        """
        Initialize SimplyBook.me service
        
        Args:
            api_key: SimplyBook.me API key
            company_login: Company login (optional, can be extracted from API key)
        """
        self.api_key = api_key
        self.company_login = company_login
        self.token = None
        self.token_expires = None
    
    def _get_headers(self):
        """Get request headers with authentication"""
        headers = {
            'Content-Type': 'application/json',
            'X-Company-Login': self.company_login or self._extract_company_login(),
        }
        
        if self.token:
            headers['X-Token'] = self.token
        
        return headers
    
    def _extract_company_login(self):
        """Extract company login from API key if possible"""
        # SimplyBook.me API keys sometimes contain company login
        # If not, we'll need it from settings
        return self.company_login or ''
    
    def authenticate(self):
        """
        Authenticate with SimplyBook.me API
        Returns True if successful, False otherwise
        """
        try:
            # SimplyBook.me uses token-based auth
            # The API key might be used directly or we need to get a token
            # For now, we'll try using the API key as token
            self.token = self.api_key
            self.token_expires = timezone.now() + timedelta(hours=24)
            return True
        except Exception as e:
            logger.error(f"SimplyBook.me authentication error: {str(e)}")
            return False
    
    def get_clients(self, limit=100, offset=0):
        """
        Fetch clients from SimplyBook.me
        
        Args:
            limit: Maximum number of clients to fetch
            offset: Offset for pagination
            
        Returns:
            List of client dictionaries or None if error
        """
        try:
            if not self.authenticate():
                return None
            
            # SimplyBook.me API endpoint for clients
            # Try multiple possible endpoints based on API version
            endpoints = [
                f"{self.BASE_URL}/admin/clients",
                f"{self.BASE_URL}/v2/admin/clients",
                f"{self.BASE_URL}/admin/client",
            ]
            
            params = {
                'limit': limit,
                'offset': offset,
            }
            
            last_error = None
            for url in endpoints:
                try:
                    response = requests.get(
                        url,
                        headers=self._get_headers(),
                        params=params,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        # SimplyBook.me returns data in different formats
                        # Handle both 'data' and direct list responses
                        if isinstance(data, dict):
                            if 'data' in data:
                                return data['data']
                            elif 'result' in data:
                                return data['result']
                            elif 'clients' in data:
                                return data['clients']
                        elif isinstance(data, list):
                            return data
                        else:
                            logger.warning(f"Unexpected SimplyBook.me response format: {type(data)}")
                            # Try to extract any client-like data
                            if isinstance(data, dict):
                                for key in ['clients', 'data', 'result', 'items']:
                                    if key in data and isinstance(data[key], list):
                                        return data[key]
                    
                    elif response.status_code == 401:
                        logger.error(f"SimplyBook.me authentication failed: {response.text}")
                        return None
                    else:
                        last_error = f"Status {response.status_code}: {response.text[:200]}"
                        continue  # Try next endpoint
                        
                except requests.exceptions.RequestException as e:
                    last_error = str(e)
                    continue  # Try next endpoint
            
            # If all endpoints failed, return None with error
            logger.error(f"SimplyBook.me API error (all endpoints failed): {last_error}")
            return None
                
        except Exception as e:
            logger.error(f"SimplyBook.me get_clients error: {str(e)}")
            return None
    
    def get_bookings(self, start_date=None, end_date=None, limit=100):
        """
        Fetch bookings from SimplyBook.me
        
        Args:
            start_date: Start date for bookings (datetime)
            end_date: End date for bookings (datetime)
            limit: Maximum number of bookings to fetch
            
        Returns:
            List of booking dictionaries or None if error
        """
        try:
            if not self.authenticate():
                return None
            
            url = f"{self.BASE_URL}/admin/bookings"
            
            params = {
                'limit': limit,
            }
            
            if start_date:
                params['start_date'] = start_date.isoformat()
            if end_date:
                params['end_date'] = end_date.isoformat()
            
            response = requests.get(
                url,
                headers=self._get_headers(),
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'data' in data:
                    return data['data']
                elif isinstance(data, list):
                    return data
                else:
                    return []
            else:
                logger.error(f"SimplyBook.me bookings API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"SimplyBook.me get_bookings error: {str(e)}")
            return None
    
    def get_availability(self, service_id=None, start_date=None, end_date=None):
        """
        Get available time slots from SimplyBook.me
        
        Args:
            service_id: Service ID to check availability for
            start_date: Start date for availability check
            end_date: End date for availability check
            
        Returns:
            List of available time slots or None if error
        """
        try:
            if not self.authenticate():
                return None
            
            url = f"{self.BASE_URL}/admin/availability"
            
            params = {}
            if service_id:
                params['service_id'] = service_id
            if start_date:
                params['start_date'] = start_date.isoformat()
            if end_date:
                params['end_date'] = end_date.isoformat()
            
            response = requests.get(
                url,
                headers=self._get_headers(),
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'data' in data:
                    return data['data']
                elif isinstance(data, list):
                    return data
                else:
                    return []
            else:
                logger.error(f"SimplyBook.me availability API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"SimplyBook.me get_availability error: {str(e)}")
            return None
    
    def create_booking(self, booking_data):
        """
        Create a new booking in SimplyBook.me
        
        Args:
            booking_data: Dictionary with booking details
                - client_id: Client ID in SimplyBook.me
                - service_id: Service ID
                - start_time: Start time (ISO format)
                - end_time: End time (ISO format)
                - notes: Optional notes
                
        Returns:
            Created booking data or None if error
        """
        try:
            if not self.authenticate():
                return None
            
            url = f"{self.BASE_URL}/admin/bookings"
            
            response = requests.post(
                url,
                headers=self._get_headers(),
                json=booking_data,
                timeout=30
            )
            
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                if isinstance(data, dict) and 'data' in data:
                    return data['data']
                elif isinstance(data, dict):
                    return data
                else:
                    return data
            else:
                logger.error(f"SimplyBook.me create booking error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"SimplyBook.me create_booking error: {str(e)}")
            return None
    
    def update_booking(self, booking_id, booking_data):
        """
        Update an existing booking in SimplyBook.me
        
        Args:
            booking_id: Booking ID in SimplyBook.me
            booking_data: Dictionary with updated booking details
            
        Returns:
            Updated booking data or None if error
        """
        try:
            if not self.authenticate():
                return None
            
            url = f"{self.BASE_URL}/admin/bookings/{booking_id}"
            
            response = requests.put(
                url,
                headers=self._get_headers(),
                json=booking_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'data' in data:
                    return data['data']
                elif isinstance(data, dict):
                    return data
                else:
                    return data
            else:
                logger.error(f"SimplyBook.me update booking error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"SimplyBook.me update_booking error: {str(e)}")
            return None
    
    def cancel_booking(self, booking_id, reason=None):
        """
        Cancel a booking in SimplyBook.me
        
        Args:
            booking_id: Booking ID in SimplyBook.me
            reason: Optional cancellation reason
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.authenticate():
                return False
            
            url = f"{self.BASE_URL}/admin/bookings/{booking_id}/cancel"
            
            data = {}
            if reason:
                data['reason'] = reason
            
            response = requests.post(
                url,
                headers=self._get_headers(),
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return True
            else:
                logger.error(f"SimplyBook.me cancel booking error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"SimplyBook.me cancel_booking error: {str(e)}")
            return False
    
    def update_client(self, client_id, client_data):
        """
        Update a client in SimplyBook.me
        
        Args:
            client_id: Client ID in SimplyBook.me
            client_data: Dictionary with updated client details
                - name: Client name
                - email: Client email
                - phone: Client phone
                - notes: Optional notes
                
        Returns:
            Updated client data or None if error
        """
        try:
            if not self.authenticate():
                return None
            
            url = f"{self.BASE_URL}/admin/clients/{client_id}"
            
            response = requests.put(
                url,
                headers=self._get_headers(),
                json=client_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'data' in data:
                    return data['data']
                elif isinstance(data, dict):
                    return data
                else:
                    return data
            else:
                logger.error(f"SimplyBook.me update client error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"SimplyBook.me update_client error: {str(e)}")
            return None
    
    def sync_lead_to_crm(self, lead, client_id=None):
        """
        Sync a lead from system to SimplyBook.me CRM
        
        Args:
            lead: Lead model instance
            client_id: Existing client ID in SimplyBook.me (if updating)
            
        Returns:
            Tuple of (success: bool, client_id: str or None, error: str or None)
        """
        try:
            if not self.authenticate():
                return (False, None, "Authentication failed")
            
            client_data = {
                'name': lead.name,
                'email': lead.email,
            }
            
            if lead.phone:
                client_data['phone'] = lead.phone
            
            if lead.notes:
                client_data['notes'] = lead.notes
            
            # Add lead status as custom field if supported
            if lead.status:
                client_data['status'] = lead.status
            
            if client_id:
                # Update existing client
                result = self.update_client(client_id, client_data)
                if result:
                    return (True, client_id, None)
                else:
                    return (False, None, "Failed to update client in SimplyBook.me")
            else:
                # Create new client
                url = f"{self.BASE_URL}/admin/clients"
                response = requests.post(
                    url,
                    headers=self._get_headers(),
                    json=client_data,
                    timeout=30
                )
                
                if response.status_code == 200 or response.status_code == 201:
                    data = response.json()
                    new_client_id = None
                    if isinstance(data, dict):
                        new_client_id = data.get('id') or data.get('client_id') or data.get('data', {}).get('id')
                    elif isinstance(data, list) and len(data) > 0:
                        new_client_id = data[0].get('id')
                    
                    if new_client_id:
                        return (True, str(new_client_id), None)
                    else:
                        return (False, None, "Client created but ID not returned")
                else:
                    logger.error(f"SimplyBook.me create client error: {response.status_code} - {response.text}")
                    return (False, None, f"Failed to create client: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"SimplyBook.me sync_lead_to_crm error: {str(e)}")
            return (False, None, str(e))
    
    def sync_booking_to_crm(self, booking, client_id):
        """
        Sync a booking from system to SimplyBook.me
        
        Args:
            booking: Booking model instance
            client_id: Client ID in SimplyBook.me
            
        Returns:
            Tuple of (success: bool, booking_id: str or None, error: str or None)
        """
        try:
            if not self.authenticate():
                return (False, None, "Authentication failed")
            
            booking_data = {
                'client_id': client_id,
                'start_time': booking.start_time.isoformat(),
                'end_time': booking.end_time.isoformat(),
            }
            
            if booking.title:
                booking_data['title'] = booking.title
            
            if booking.notes:
                booking_data['notes'] = booking.notes
            
            if booking.location:
                booking_data['location'] = booking.location
            
            if booking.booking_type:
                booking_data['service_id'] = booking.booking_type  # Assuming booking_type contains service_id
            
            if booking.external_id:
                # Update existing booking
                result = self.update_booking(booking.external_id, booking_data)
                if result:
                    return (True, booking.external_id, None)
                else:
                    return (False, None, "Failed to update booking in SimplyBook.me")
            else:
                # Create new booking
                result = self.create_booking(booking_data)
                if result:
                    new_booking_id = None
                    if isinstance(result, dict):
                        new_booking_id = result.get('id') or result.get('booking_id') or result.get('data', {}).get('id')
                    
                    if new_booking_id:
                        return (True, str(new_booking_id), None)
                    else:
                        return (False, None, "Booking created but ID not returned")
                else:
                    return (False, None, "Failed to create booking in SimplyBook.me")
                    
        except Exception as e:
            logger.error(f"SimplyBook.me sync_booking_to_crm error: {str(e)}")
            return (False, None, str(e))
    
    def sync_bookings_to_database(self, user, bookings_data):
        """
        Sync SimplyBook.me bookings to Booking model
        
        Args:
            user: Django User instance
            bookings_data: List of booking dictionaries from SimplyBook.me
            
        Returns:
            Tuple of (created_count, updated_count, errors)
        """
        from bookings.models import Booking
        from leads.models import Lead
        
        created_count = 0
        updated_count = 0
        errors = []
        
        if not bookings_data:
            return (0, 0, ['No bookings data provided'])
        
        for booking_data in bookings_data:
            try:
                # Extract booking information
                external_id = booking_data.get('id') or booking_data.get('booking_id') or booking_data.get('external_id')
                client_email = booking_data.get('client_email') or booking_data.get('email') or booking_data.get('client', {}).get('email')
                
                if not client_email:
                    errors.append(f"Booking missing client email: {booking_data}")
                    continue
                
                if not external_id:
                    errors.append(f"Booking missing external ID: {booking_data}")
                    continue
                
                # Find or create lead
                try:
                    lead = Lead.objects.get(user=user, email=client_email)
                except Lead.DoesNotExist:
                    # Create lead if doesn't exist
                    client_name = booking_data.get('client_name') or booking_data.get('name') or 'Unknown'
                    lead = Lead.objects.create(
                        user=user,
                        email=client_email,
                        name=client_name,
                        source='SimplyBook.me'
                    )
                
                # Parse dates
                start_time_str = booking_data.get('start_time') or booking_data.get('start') or booking_data.get('date')
                end_time_str = booking_data.get('end_time') or booking_data.get('end')
                
                if not start_time_str:
                    errors.append(f"Booking missing start time: {external_id}")
                    continue
                
                try:
                    from datetime import datetime
                    if isinstance(start_time_str, str):
                        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                    else:
                        start_time = start_time_str
                    
                    if end_time_str:
                        if isinstance(end_time_str, str):
                            end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
                        else:
                            end_time = end_time_str
                    else:
                        # Default to 1 hour duration
                        from datetime import timedelta
                        end_time = start_time + timedelta(hours=1)
                except Exception as e:
                    errors.append(f"Error parsing booking dates: {str(e)}")
                    continue
                
                # Create or update booking
                booking, created = Booking.objects.get_or_create(
                    user=user,
                    external_id=str(external_id),
                    external_source='SimplyBook.me',
                    defaults={
                        'lead': lead,
                        'title': booking_data.get('title') or booking_data.get('service_name') or 'Booking',
                        'description': booking_data.get('description') or booking_data.get('notes') or '',
                        'start_time': start_time,
                        'end_time': end_time,
                        'duration_minutes': booking_data.get('duration') or 60,
                        'status': booking_data.get('status') or 'scheduled',
                        'location': booking_data.get('location') or '',
                        'booking_type': booking_data.get('service_name') or booking_data.get('type') or '',
                    }
                )
                
                if created:
                    created_count += 1
                    logger.info(f"Created booking from SimplyBook.me: {booking.id}")
                else:
                    # Update existing booking
                    updated = False
                    if booking.start_time != start_time:
                        booking.start_time = start_time
                        updated = True
                    if booking.end_time != end_time:
                        booking.end_time = end_time
                        updated = True
                    
                    if updated:
                        booking.save()
                        updated_count += 1
                        logger.info(f"Updated booking from SimplyBook.me: {booking.id}")
                        
            except Exception as e:
                error_msg = f"Error syncing booking {booking_data.get('id', 'unknown')}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)
        
        return (created_count, updated_count, errors)
    
    def sync_clients_to_leads(self, user, clients_data):
        """
        Sync SimplyBook.me clients to Lead model
        
        Args:
            user: Django User instance
            clients_data: List of client dictionaries from SimplyBook.me
            
        Returns:
            Tuple of (created_count, updated_count, errors)
        """
        from leads.models import Lead
        
        created_count = 0
        updated_count = 0
        errors = []
        
        if not clients_data:
            return (0, 0, ['No clients data provided'])
        
        for client_data in clients_data:
            try:
                # Extract client information
                # SimplyBook.me client structure may vary
                email = client_data.get('email') or client_data.get('client_email') or client_data.get('email_address')
                name = client_data.get('name') or client_data.get('client_name') or client_data.get('full_name') or 'Unknown'
                phone = client_data.get('phone') or client_data.get('phone_number') or client_data.get('mobile')
                
                if not email:
                    errors.append(f"Client missing email: {client_data}")
                    continue
                
                lead, created = Lead.objects.get_or_create(
                    user=user,
                    email=email,
                    defaults={
                        'name': name,
                        'phone': phone or '',
                        'source': 'SimplyBook.me',
                        'notes': f"Synced from SimplyBook.me on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}",
                    }
                )
                
                if created:
                    created_count += 1
                    logger.info(f"Created lead from SimplyBook.me: {lead.email}")
                else:
                    updated = False
                    if lead.name != name: lead.name = name; updated = True
                    if phone and lead.phone != phone: lead.phone = phone; updated = True
                    if lead.source != 'SimplyBook.me': lead.source = 'SimplyBook.me'; updated = True
                    
                    if updated:
                        lead.save()
                        updated_count += 1
                        logger.info(f"Updated lead from SimplyBook.me: {lead.email}")
                        
            except Exception as e:
                error_msg = f"Error syncing client {client_data.get('email', 'unknown')}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)
        
        return (created_count, updated_count, errors)
