"""
Automation Execution Engine
Handles the execution of automations based on triggers
"""

from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from leads.models import Lead
from messages.models import Message
from ai_integration.models import AgentActivity
from ai_integration.views import generate_ai_response
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class AutomationExecutor:
    """Executes automations based on triggers and conditions"""
    
    def __init__(self, automation, context=None):
        self.automation = automation
        self.context = context or {}
        self.user = automation.user
    
    def execute(self):
        """Execute the automation"""
        if not self.automation.should_trigger(self.context):
            logger.info(f"Automation {self.automation.id} should not trigger")
            return False
        
        try:
            # Execute based on automation type
            if self.automation.type == 'lead_followup':
                return self._execute_lead_followup()
            elif self.automation.type == 'booking_reminder':
                return self._execute_booking_reminder()
            elif self.automation.type == 'confirmation':
                return self._execute_confirmation()
            elif self.automation.type == 'post_session':
                return self._execute_post_session()
            elif self.automation.type == 'crm_update':
                return self._execute_crm_update()
            elif self.automation.type == 'no_show_followup':
                return self._execute_no_show_followup()
            else:
                logger.warning(f"Unknown automation type: {self.automation.type}")
                return False
        except Exception as e:
            logger.error(f"Error executing automation {self.automation.id}: {str(e)}")
            return False
    
    def _execute_lead_followup(self):
        """Execute lead follow-up automation"""
        lead = self.context.get('lead')
        if not lead:
            logger.warning("No lead in context for lead follow-up")
            return False
        
        # Check if we should send (delay logic)
        if not self._check_delay(lead):
            return False
        
        # Generate message
        message_content = self._generate_message(lead, "follow-up")
        
        # Create message record
        message = Message.objects.create(
            user=self.user,
            lead=lead,
            channel=self.automation.channel,
            direction='outbound',
            content=message_content,
            status='pending',  # Will be updated after sending
            ai_generated=True,
            timestamp=timezone.now()
        )
        
        # Actually send the message
        try:
            from messaging.services import MessageSender
            sender = MessageSender(self.user)
            sent = sender.send_message(message)
            
            if not sent:
                logger.warning(f"Failed to send message {message.id} via {self.automation.channel}")
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            message.status = 'failed'
            message.save()
        
        # Update lead last_contacted
        lead.last_contacted = timezone.now()
        lead.save()
        
        # Log activity
        AgentActivity.objects.create(
            user=self.user,
            type='automation_ran',
            description=f'Lead follow-up automation triggered for {lead.name}',
            channel=self.automation.channel,
            lead=lead,
            details={
                'automation_id': self.automation.id,
                'automation_name': self.automation.name,
                'message_id': message.id
            }
        )
        
        # Update automation tracking
        self.automation.times_triggered += 1
        self.automation.last_triggered = timezone.now()
        self.automation.save()
        
        logger.info(f"Lead follow-up automation executed for lead {lead.id}")
        return True
    
    def _execute_booking_reminder(self):
        """Execute booking reminder automation"""
        lead = self.context.get('lead')
        booking = self.context.get('booking')
        
        if not lead:
            logger.warning("No lead in context for booking reminder")
            return False
        
        # Generate reminder message
        booking_info = f"Your booking is scheduled" if booking else "Your upcoming session"
        message_content = self._generate_message(lead, f"reminder about {booking_info}")
        
        # Create message record
        message = Message.objects.create(
            user=self.user,
            lead=lead,
            channel=self.automation.channel,
            direction='outbound',
            content=message_content,
            status='pending',  # Will be updated after sending
            ai_generated=True,
            timestamp=timezone.now()
        )
        
        # Actually send the message
        try:
            from messaging.services import MessageSender
            sender = MessageSender(self.user)
            sent = sender.send_message(message)
            
            if not sent:
                logger.warning(f"Failed to send booking reminder message {message.id}")
        except Exception as e:
            logger.error(f"Error sending booking reminder: {str(e)}")
            message.status = 'failed'
            message.save()
        
        # Log activity
        AgentActivity.objects.create(
            user=self.user,
            type='automation_ran',
            description=f'Booking reminder sent to {lead.name}',
            channel=self.automation.channel,
            lead=lead,
            details={
                'automation_id': self.automation.id,
                'automation_name': self.automation.name,
                'message_id': message.id,
                'booking_id': booking.get('id') if booking else None
            }
        )
        
        # Update automation tracking
        self.automation.times_triggered += 1
        self.automation.last_triggered = timezone.now()
        self.automation.save()
        
        logger.info(f"Booking reminder automation executed for lead {lead.id}")
        return True
    
    def _execute_confirmation(self):
        """Execute confirmation automation"""
        lead = self.context.get('lead')
        booking = self.context.get('booking')
        
        if not lead:
            return False
        
        message_content = self._generate_message(lead, "confirmation message")
        
        message = Message.objects.create(
            user=self.user,
            lead=lead,
            channel=self.automation.channel,
            direction='outbound',
            content=message_content,
            status='pending',  # Will be updated after sending
            ai_generated=True,
            timestamp=timezone.now()
        )
        
        # Actually send the message
        try:
            from messaging.services import MessageSender
            sender = MessageSender(self.user)
            sent = sender.send_message(message)
            
            if not sent:
                logger.warning(f"Failed to send confirmation message {message.id}")
        except Exception as e:
            logger.error(f"Error sending confirmation: {str(e)}")
            message.status = 'failed'
            message.save()
        
        AgentActivity.objects.create(
            user=self.user,
            type='automation_ran',
            description=f'Confirmation sent to {lead.name}',
            channel=self.automation.channel,
            lead=lead,
            details={'automation_id': self.automation.id, 'message_id': message.id}
        )
        
        self.automation.times_triggered += 1
        self.automation.last_triggered = timezone.now()
        self.automation.save()
        
        return True
    
    def _execute_post_session(self):
        """Execute post-session follow-up automation"""
        lead = self.context.get('lead')
        session = self.context.get('session')
        
        if not lead:
            return False
        
        message_content = self._generate_message(lead, "post-session follow-up")
        
        message = Message.objects.create(
            user=self.user,
            lead=lead,
            channel=self.automation.channel,
            direction='outbound',
            content=message_content,
            status='pending',  # Will be updated after sending
            ai_generated=True,
            timestamp=timezone.now()
        )
        
        # Actually send the message
        try:
            from messaging.services import MessageSender
            sender = MessageSender(self.user)
            sent = sender.send_message(message)
            
            if not sent:
                logger.warning(f"Failed to send post-session message {message.id}")
        except Exception as e:
            logger.error(f"Error sending post-session follow-up: {str(e)}")
            message.status = 'failed'
            message.save()
        
        AgentActivity.objects.create(
            user=self.user,
            type='automation_ran',
            description=f'Post-session follow-up sent to {lead.name}',
            channel=self.automation.channel,
            lead=lead,
            details={'automation_id': self.automation.id, 'message_id': message.id}
        )
        
        self.automation.times_triggered += 1
        self.automation.last_triggered = timezone.now()
        self.automation.save()
        
        return True
    
    def _execute_no_show_followup(self):
        """Execute no-show follow-up automation"""
        lead = self.context.get('lead')
        booking = self.context.get('booking')
        
        if not lead:
            return False
        
        message_content = self._generate_message(lead, "no-show follow-up message")
        
        message = Message.objects.create(
            user=self.user,
            lead=lead,
            channel=self.automation.channel,
            direction='outbound',
            content=message_content,
            status='pending',  # Will be updated after sending
            ai_generated=True,
            timestamp=timezone.now()
        )
        
        # Actually send the message
        try:
            from messaging.services import MessageSender
            sender = MessageSender(self.user)
            sent = sender.send_message(message)
            
            if not sent:
                logger.warning(f"Failed to send no-show follow-up message {message.id}")
        except Exception as e:
            logger.error(f"Error sending no-show follow-up: {str(e)}")
            message.status = 'failed'
            message.save()
        
        AgentActivity.objects.create(
            user=self.user,
            type='automation_ran',
            description=f'No-show follow-up sent to {lead.name}',
            channel=self.automation.channel,
            lead=lead,
            details={'automation_id': self.automation.id, 'message_id': message.id, 'booking_id': booking.id if booking else None}
        )
        
        self.automation.times_triggered += 1
        self.automation.last_triggered = timezone.now()
        self.automation.save()
        
        return True
    
    def _execute_crm_update(self):
        """Execute CRM update automation"""
        lead = self.context.get('lead')
        if not lead:
            return False
        
        # Update lead status or other fields based on automation conditions
        # This is a placeholder - actual CRM updates would go here
        # For now, we'll just log the activity
        
        AgentActivity.objects.create(
            user=self.user,
            type='crm_updated',
            description=f'CRM updated for {lead.name} via automation',
            lead=lead,
            details={
                'automation_id': self.automation.id,
                'automation_name': self.automation.name,
                'updates': self.context.get('updates', {})
            }
        )
        
        self.automation.times_triggered += 1
        self.automation.last_triggered = timezone.now()
        self.automation.save()
        
        return True
    
    def _check_delay(self, lead):
        """Check if delay conditions are met"""
        if self.automation.delay_days == 0 and self.automation.delay_hours == 0:
            return True  # No delay, execute immediately
        
        # Calculate target time
        if self.automation.trigger == 'new_lead':
            reference_time = lead.created_at
        elif self.automation.trigger == 'no_contact_days':
            reference_time = lead.last_contacted or lead.created_at
        else:
            reference_time = timezone.now()
        
        target_time = reference_time + timedelta(
            days=self.automation.delay_days,
            hours=self.automation.delay_hours
        )
        
        # Check if enough time has passed
        return timezone.now() >= target_time
    
    def _generate_message(self, lead, message_type):
        """Generate message content using AI or template"""
        # Use template if provided
        if self.automation.message_template:
            # Simple template replacement
            message = self.automation.message_template
            message = message.replace('{lead_name}', lead.name)
            message = message.replace('{lead_email}', lead.email)
            return message
        
        # Otherwise, use AI to generate
        try:
            # Import here to avoid circular imports
            from django.conf import settings
            import google.generativeai as genai
            
            if not settings.GEMINI_API_KEY:
                return f"Hi {lead.name}, this is a {message_type} message."
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            prompt = f"Write a professional, warm {message_type} message for {lead.name} ({lead.email}). Keep it brief and personal."
            
            response = model.generate_content(
                prompt,
                generation_config={'max_output_tokens': 200, 'temperature': 0.7}
            )
            
            return response.text
        except Exception as e:
            logger.error(f"Error generating AI message: {str(e)}")
            return f"Hi {lead.name}, this is a {message_type} message."


def trigger_automations(trigger_type, context=None):
    """
    Trigger all automations matching a trigger type
    
    Args:
        trigger_type: One of the TRIGGER_CHOICES
        context: Dictionary with context data (lead, booking, etc.)
    """
    from .models import Automation
    from settings.models import UserSettings
    
    # Find all enabled automations with matching trigger
    automations = Automation.objects.filter(
        enabled=True,
        trigger=trigger_type,
        user=context.get('user') if context else None
    )
    
    if context and context.get('user'):
        automations = automations.filter(user=context['user'])
        
        # Check user settings to see if automation type is globally enabled
        try:
            user_settings = UserSettings.objects.get(user=context['user'])
            # Filter automations based on user settings
            automation_type_enabled = {
                'lead_followup': user_settings.lead_followup_enabled,
                'booking_reminder': user_settings.booking_reminder_enabled,
                'confirmation': user_settings.confirmation_enabled,
                'post_session': user_settings.post_session_enabled,
            }
            # Filter out automations if their type is disabled in settings
            filtered_automations = []
            for automation in automations:
                if automation_type_enabled.get(automation.type, True):
                    filtered_automations.append(automation)
            automations = filtered_automations
        except UserSettings.DoesNotExist:
            pass  # If no settings, allow all automations
    
    executed_count = 0
    for automation in automations:
        # Check if channel is enabled in user settings
        if context and context.get('user'):
            try:
                from settings.models import UserSettings
                user_settings = UserSettings.objects.get(user=context['user'])
                channel_enabled = {
                    'email': user_settings.email_enabled,
                    'sms': user_settings.sms_enabled,
                    'whatsapp': user_settings.whatsapp_enabled,
                    'facebook': user_settings.facebook_enabled,
                    'instagram': user_settings.instagram_enabled,
                }
                if not channel_enabled.get(automation.channel, True):
                    logger.info(f"Skipping automation {automation.id} - channel {automation.channel} is disabled")
                    continue
            except UserSettings.DoesNotExist:
                pass
        
        executor = AutomationExecutor(automation, context)
        if executor.execute():
            executed_count += 1
    
    logger.info(f"Triggered {executed_count} automations for trigger type: {trigger_type}")
    return executed_count


def check_scheduled_automations():
    """
    Check and execute automations that are scheduled (e.g., no_contact_days)
    This should be called periodically (via cron or celery)
    """
    from .models import Automation
    from django.utils import timezone
    from datetime import timedelta
    
    # Get all enabled automations with scheduled triggers
    automations = Automation.objects.filter(
        enabled=True,
        trigger__in=['no_contact_days', 'booking_reminder_hours']
    )
    
    executed_count = 0
    
    for automation in automations:
        if automation.trigger == 'no_contact_days':
            # Find leads that haven't been contacted
            delay_days = automation.delay_days or automation.delay_hours // 24
            cutoff_date = timezone.now() - timedelta(days=delay_days)
            
            leads = Lead.objects.filter(
                user=automation.user,
                status__in=['new', 'contacted', 'qualified'],
                last_contacted__lt=cutoff_date
            ).exclude(last_contacted__isnull=True)
            
            for lead in leads:
                context = {
                    'user': automation.user,
                    'lead': lead
                }
                executor = AutomationExecutor(automation, context)
                if executor.execute():
                    executed_count += 1
    
    logger.info(f"Executed {executed_count} scheduled automations")
    return executed_count

