from rest_framework import generics, status
from rest_framework import serializers as drf_serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Message
from .serializers import MessageSerializer
from leads.models import Lead
import logging

logger = logging.getLogger(__name__)


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Avoid select_related to prevent recursion issues with Python 3.13
        queryset = Message.objects.filter(user=self.request.user).order_by('-timestamp')
        lead_id = self.request.query_params.get('leadId', None)
        if lead_id:
            queryset = queryset.filter(lead_id=lead_id)
        return queryset

    def perform_create(self, serializer):
        lead_id = self.request.data.get('leadId')
        try:
            lead = Lead.objects.get(id=lead_id, user=self.request.user)
        except Lead.DoesNotExist:
            raise drf_serializers.ValidationError('Lead not found')
        
        message = serializer.save(user=self.request.user, lead=lead, direction='outbound', status='pending')
        
        # Actually send the message if it's outbound
        if message.direction == 'outbound':
            try:
                from messaging.services import MessageSender
                sender = MessageSender(self.request.user)
                sent = sender.send_message(message)
                
                if not sent:
                    logger.warning(f"Failed to send message {message.id} via API")
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error sending message: {str(e)}")
                message.status = 'failed'
                message.save()

