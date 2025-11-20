"""
Messaging Service
Handles actual sending of messages via different channels (email, SMS, WhatsApp, etc.)
"""

import logging
from django.core.mail import send_mail
from django.conf import settings
from messages.models import Message
from settings.models import UserSettings
import requests

logger = logging.getLogger(__name__)


class MessageSender:
    """Service for sending messages through different channels"""
    
    def __init__(self, user):
        self.user = user
        self.settings = None
        try:
            self.settings = UserSettings.objects.get(user=user)
        except UserSettings.DoesNotExist:
            pass
    
    def send_message(self, message: Message):
        """
        Send a message through the appropriate channel
        
        Args:
            message: Message model instance
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        # Check if channel is enabled
        if self.settings:
            channel_enabled = {
                'email': self.settings.email_enabled,
                'sms': self.settings.sms_enabled,
                'whatsapp': self.settings.whatsapp_enabled,
                'facebook': self.settings.facebook_enabled,
                'instagram': self.settings.instagram_enabled,
            }
            
            if not channel_enabled.get(message.channel, True):
                logger.info(f"Channel {message.channel} is disabled for user {self.user.email}")
                message.status = 'failed'
                message.save()
                return False
        
        # Route to appropriate channel handler
        if message.channel == 'email':
            return self._send_email(message)
        elif message.channel == 'sms':
            return self._send_sms(message)
        elif message.channel == 'whatsapp':
            return self._send_whatsapp(message)
        elif message.channel == 'facebook':
            return self._send_facebook(message)
        elif message.channel == 'instagram':
            return self._send_instagram(message)
        else:
            logger.warning(f"Unknown channel: {message.channel}")
            message.status = 'failed'
            message.save()
            return False
    
    def _send_email(self, message: Message):
        """Send email via SMTP"""
        try:
            lead = message.lead
            
            # Get email settings
            email_host = getattr(settings, 'EMAIL_HOST', None)
            email_port = getattr(settings, 'EMAIL_PORT', 587)
            email_use_tls = getattr(settings, 'EMAIL_USE_TLS', True)
            email_host_user = getattr(settings, 'EMAIL_HOST_USER', '')
            email_host_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
            
            # If SMTP is configured, use it
            if email_host and email_host_user and email_host_password:
                from django.core.mail import get_connection
                connection = get_connection(
                    host=email_host,
                    port=email_port,
                    username=email_host_user,
                    password=email_host_password,
                    use_tls=email_use_tls,
                )
                
                send_mail(
                    subject=f'Message from {settings.DEFAULT_FROM_EMAIL}',
                    message=message.content,
                    from_email=email_host_user,
                    recipient_list=[lead.email],
                    connection=connection,
                    fail_silently=False,
                )
                
                message.status = 'sent'
                message.save()
                logger.info(f"Email sent to {lead.email} via SMTP")
                return True
            else:
                # Fallback to console backend (development)
                send_mail(
                    subject=f'Message from Infinite Base Agent',
                    message=message.content,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@infinitebaseagent.com'),
                    recipient_list=[lead.email],
                    fail_silently=False,
                )
                
                message.status = 'sent'
                message.save()
                logger.info(f"Email sent to {lead.email} (console backend)")
                print(f"\n[EMAIL SENT] To: {lead.email}\nSubject: Message from Infinite Base Agent\nContent: {message.content}\n")
                return True
                
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            message.status = 'failed'
            message.save()
            return False
    
    def _send_sms(self, message: Message):
        """Send SMS via Twilio"""
        try:
            lead = message.lead
            
            # Get Twilio settings
            twilio_account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
            twilio_auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
            twilio_phone_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
            
            if not all([twilio_account_sid, twilio_auth_token, twilio_phone_number]):
                logger.warning("Twilio not configured. SMS not sent.")
                message.status = 'failed'
                message.save()
                return False
            
            if not lead.phone:
                logger.warning(f"No phone number for lead {lead.id}")
                message.status = 'failed'
                message.save()
                return False
            
            # Send via Twilio API
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_account_sid}/Messages.json"
            auth = (twilio_account_sid, twilio_auth_token)
            data = {
                'From': twilio_phone_number,
                'To': lead.phone,
                'Body': message.content
            }
            
            response = requests.post(url, auth=auth, data=data, timeout=10)
            
            if response.status_code == 201:
                message.status = 'sent'
                message.save()
                logger.info(f"SMS sent to {lead.phone} via Twilio")
                return True
            else:
                logger.error(f"Twilio API error: {response.status_code} - {response.text}")
                message.status = 'failed'
                message.save()
                return False
                
        except Exception as e:
            logger.error(f"Error sending SMS: {str(e)}")
            message.status = 'failed'
            message.save()
            return False
    
    def _send_whatsapp(self, message: Message):
        """Send WhatsApp message via Twilio WhatsApp API"""
        try:
            lead = message.lead
            
            # Get Twilio settings
            twilio_account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
            twilio_auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
            twilio_whatsapp_from = getattr(settings, 'TWILIO_WHATSAPP_FROM', f'whatsapp:+14155238886')
            
            if not all([twilio_account_sid, twilio_auth_token]):
                logger.warning("Twilio not configured. WhatsApp not sent.")
                message.status = 'failed'
                message.save()
                return False
            
            if not lead.phone:
                logger.warning(f"No phone number for lead {lead.id}")
                message.status = 'failed'
                message.save()
                return False
            
            # Format phone number for WhatsApp (E.164 format)
            phone = lead.phone
            if not phone.startswith('+'):
                # Assume US number if no country code
                phone = f'+1{phone.replace("-", "").replace(" ", "").replace("(", "").replace(")", "")}'
            
            # Send via Twilio WhatsApp API
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_account_sid}/Messages.json"
            auth = (twilio_account_sid, twilio_auth_token)
            data = {
                'From': twilio_whatsapp_from,
                'To': f'whatsapp:{phone}',
                'Body': message.content
            }
            
            response = requests.post(url, auth=auth, data=data, timeout=10)
            
            if response.status_code == 201:
                message.status = 'sent'
                message.save()
                logger.info(f"WhatsApp sent to {lead.phone} via Twilio")
                return True
            else:
                logger.error(f"Twilio WhatsApp API error: {response.status_code} - {response.text}")
                message.status = 'failed'
                message.save()
                return False
                
        except Exception as e:
            logger.error(f"Error sending WhatsApp: {str(e)}")
            message.status = 'failed'
            message.save()
            return False
    
    def _send_facebook(self, message: Message):
        """Send Facebook Messenger message"""
        try:
            lead = message.lead
            
            # Get Facebook settings from user settings
            from settings.models import UserSettings
            try:
                user_settings = UserSettings.objects.get(user=self.user)
            except UserSettings.DoesNotExist:
                logger.warning("User settings not found for Facebook")
                message.status = 'failed'
                message.save()
                return False
            
            # Get Facebook credentials from onboarding or settings
            from onboarding.models import OnboardingStep
            try:
                onboarding = OnboardingStep.objects.get(user=self.user)
                page_id = onboarding.facebook_page_id
                access_token = onboarding.facebook_access_token
            except OnboardingStep.DoesNotExist:
                logger.warning("Facebook not configured. Please complete onboarding.")
                message.status = 'failed'
                message.save()
                return False
            
            if not page_id or not access_token:
                logger.warning("Facebook credentials not configured")
                message.status = 'failed'
                message.save()
                return False
            
            # Get Facebook user ID from lead (would be stored in lead metadata)
            # For now, we'll need to get it from lead's social_media_id or similar
            facebook_user_id = getattr(lead, 'facebook_user_id', None) or lead.email  # Fallback to email
            
            if not facebook_user_id:
                logger.warning(f"No Facebook user ID for lead {lead.id}")
                message.status = 'failed'
                message.save()
                return False
            
            # Send via Facebook Messenger API
            from social_media.services import FacebookMessengerService
            messenger = FacebookMessengerService(page_id, access_token)
            success, message_id, error = messenger.send_message(facebook_user_id, message.content)
            
            if success:
                message.status = 'sent'
                message.save()
                logger.info(f"Facebook Messenger sent to {lead.email}")
                return True
            else:
                logger.error(f"Facebook Messenger error: {error}")
                message.status = 'failed'
                message.save()
                return False
                
        except Exception as e:
            logger.error(f"Error sending Facebook Messenger: {str(e)}")
            message.status = 'failed'
            message.save()
            return False
    
    def _send_instagram(self, message: Message):
        """Send Instagram DM"""
        try:
            lead = message.lead
            
            # Get Instagram settings from onboarding
            from onboarding.models import OnboardingStep
            try:
                onboarding = OnboardingStep.objects.get(user=self.user)
                instagram_account_id = onboarding.instagram_account_id
                access_token = onboarding.instagram_access_token
            except OnboardingStep.DoesNotExist:
                logger.warning("Instagram not configured. Please complete onboarding.")
                message.status = 'failed'
                message.save()
                return False
            
            if not instagram_account_id or not access_token:
                logger.warning("Instagram credentials not configured")
                message.status = 'failed'
                message.save()
                return False
            
            # Get Instagram user ID from lead
            instagram_user_id = getattr(lead, 'instagram_user_id', None) or lead.email
            
            if not instagram_user_id:
                logger.warning(f"No Instagram user ID for lead {lead.id}")
                message.status = 'failed'
                message.save()
                return False
            
            # Send via Instagram DM API
            from social_media.services import InstagramDMService
            instagram = InstagramDMService(instagram_account_id, access_token)
            success, message_id, error = instagram.send_message(instagram_user_id, message.content)
            
            if success:
                message.status = 'sent'
                message.save()
                logger.info(f"Instagram DM sent to {lead.email}")
                return True
            else:
                logger.error(f"Instagram DM error: {error}")
                message.status = 'failed'
                message.save()
                return False
                
        except Exception as e:
            logger.error(f"Error sending Instagram DM: {str(e)}")
            message.status = 'failed'
            message.save()
            return False

