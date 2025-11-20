"""
Social Media API Integration Service
Handles Facebook Messenger and Instagram DM
"""

import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class FacebookMessengerService:
    """Service for Facebook Messenger API"""
    
    BASE_URL = "https://graph.facebook.com/v18.0"
    
    def __init__(self, page_id, access_token):
        """
        Initialize Facebook Messenger service
        
        Args:
            page_id: Facebook Page ID
            access_token: Facebook Page Access Token
        """
        self.page_id = page_id
        self.access_token = access_token
    
    def send_message(self, recipient_id, message_text):
        """
        Send a message via Facebook Messenger
        
        Args:
            recipient_id: Facebook user ID (PSID)
            message_text: Message content
            
        Returns:
            Tuple of (success: bool, message_id: str or None, error: str or None)
        """
        try:
            url = f"{self.BASE_URL}/{self.page_id}/messages"
            
            data = {
                'recipient': {'id': recipient_id},
                'message': {'text': message_text},
                'messaging_type': 'RESPONSE'
            }
            
            params = {
                'access_token': self.access_token
            }
            
            response = requests.post(url, json=data, params=params, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                message_id = result.get('message_id')
                return (True, message_id, None)
            else:
                error_msg = response.json().get('error', {}).get('message', 'Unknown error')
                logger.error(f"Facebook Messenger API error: {response.status_code} - {error_msg}")
                return (False, None, error_msg)
                
        except Exception as e:
            logger.error(f"Facebook Messenger send error: {str(e)}")
            return (False, None, str(e))
    
    def get_messages(self, limit=25):
        """
        Get recent messages from Facebook Messenger
        
        Args:
            limit: Maximum number of messages to fetch
            
        Returns:
            List of messages or None if error
        """
        try:
            url = f"{self.BASE_URL}/{self.page_id}/conversations"
            
            params = {
                'access_token': self.access_token,
                'limit': limit,
                'fields': 'messages{message,from,created_time},participants'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"Facebook Messenger get messages error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Facebook Messenger get messages error: {str(e)}")
            return None
    
    def handle_webhook(self, webhook_data):
        """
        Handle incoming webhook from Facebook
        
        Args:
            webhook_data: Webhook payload from Facebook
            
        Returns:
            Processed message data or None
        """
        try:
            # Facebook webhook structure
            entries = webhook_data.get('entry', [])
            messages = []
            
            for entry in entries:
                messaging = entry.get('messaging', [])
                for event in messaging:
                    if 'message' in event and 'text' in event['message']:
                        messages.append({
                            'sender_id': event['sender']['id'],
                            'message_text': event['message']['text'],
                            'timestamp': event.get('timestamp'),
                            'message_id': event['message'].get('mid')
                        })
            
            return messages if messages else None
            
        except Exception as e:
            logger.error(f"Facebook webhook handling error: {str(e)}")
            return None


class InstagramDMService:
    """Service for Instagram Direct Messages API"""
    
    BASE_URL = "https://graph.facebook.com/v18.0"
    
    def __init__(self, instagram_account_id, access_token):
        """
        Initialize Instagram DM service
        
        Args:
            instagram_account_id: Instagram Business Account ID
            access_token: Instagram Access Token
        """
        self.instagram_account_id = instagram_account_id
        self.access_token = access_token
    
    def send_message(self, recipient_id, message_text):
        """
        Send a message via Instagram DM
        
        Args:
            recipient_id: Instagram user ID
            message_text: Message content
            
        Returns:
            Tuple of (success: bool, message_id: str or None, error: str or None)
        """
        try:
            url = f"{self.BASE_URL}/{self.instagram_account_id}/messages"
            
            data = {
                'recipient': {'id': recipient_id},
                'message': {'text': message_text}
            }
            
            params = {
                'access_token': self.access_token
            }
            
            response = requests.post(url, json=data, params=params, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                message_id = result.get('message_id')
                return (True, message_id, None)
            else:
                error_msg = response.json().get('error', {}).get('message', 'Unknown error')
                logger.error(f"Instagram DM API error: {response.status_code} - {error_msg}")
                return (False, None, error_msg)
                
        except Exception as e:
            logger.error(f"Instagram DM send error: {str(e)}")
            return (False, None, str(e))
    
    def get_messages(self, limit=25):
        """
        Get recent messages from Instagram DM
        
        Args:
            limit: Maximum number of messages to fetch
            
        Returns:
            List of messages or None if error
        """
        try:
            url = f"{self.BASE_URL}/{self.instagram_account_id}/conversations"
            
            params = {
                'access_token': self.access_token,
                'limit': limit,
                'fields': 'messages{text,from,created_time},participants'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"Instagram DM get messages error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Instagram DM get messages error: {str(e)}")
            return None
    
    def handle_webhook(self, webhook_data):
        """
        Handle incoming webhook from Instagram
        
        Args:
            webhook_data: Webhook payload from Instagram
            
        Returns:
            Processed message data or None
        """
        try:
            # Instagram webhook structure
            entries = webhook_data.get('entry', [])
            messages = []
            
            for entry in entries:
                messaging = entry.get('messaging', [])
                for event in messaging:
                    if 'message' in event and 'text' in event['message']:
                        messages.append({
                            'sender_id': event['sender']['id'],
                            'message_text': event['message']['text'],
                            'timestamp': event.get('timestamp'),
                            'message_id': event['message'].get('mid')
                        })
            
            return messages if messages else None
            
        except Exception as e:
            logger.error(f"Instagram webhook handling error: {str(e)}")
            return None

