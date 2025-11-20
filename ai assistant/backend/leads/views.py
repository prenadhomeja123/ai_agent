from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Lead
from .serializers import LeadSerializer


class LeadListCreateView(generics.ListCreateAPIView):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Lead.objects.filter(user=self.request.user).order_by('-created_at')
        # Limit results if limit parameter is provided (for dashboard)
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
        else:
            # Default limit of 500 for leads page to prevent slow loading
            queryset = queryset[:500]
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lead_stats(request):
    """Get lead statistics without fetching all leads"""
    total_leads = Lead.objects.filter(user=request.user).count()
    converted_leads = Lead.objects.filter(user=request.user, status='converted').count()
    qualified_leads = Lead.objects.filter(user=request.user, status='qualified').count()
    new_leads = Lead.objects.filter(user=request.user, status='new').count()
    
    return Response({
        'total': total_leads,
        'converted': converted_leads,
        'qualified': qualified_leads,
        'new': new_leads,
        'conversion_rate': round((converted_leads / total_leads * 100) if total_leads > 0 else 0, 2),
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'DELETE'])
def lead_detail(request, pk):
    try:
        lead = Lead.objects.get(pk=pk, user=request.user)
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = LeadSerializer(lead)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = LeadSerializer(lead, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        lead.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
