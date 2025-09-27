from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Poll, Option, Vote
from .serializers import (
    PollListSerializer, 
    PollDetailSerializer, 
    PollCreateSerializer,
    VoteSerializer,
    PollResultsSerializer
)


class PollListView(generics.ListAPIView):
    """List all public polls"""
    serializer_class = PollListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Poll.objects.filter(is_public=True)
        
        # Filter by search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        # Filter by active/expired
        status_filter = self.request.query_params.get('status', None)
        if status_filter == 'active':
            queryset = queryset.filter(expires_at__isnull=True) | queryset.filter(expires_at__gt=timezone.now())
        elif status_filter == 'expired':
            queryset = queryset.filter(expires_at__lte=timezone.now())
        
        return queryset


class PollCreateView(generics.CreateAPIView):
    """Create a new poll"""
    serializer_class = PollCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class PollDetailView(generics.RetrieveAPIView):
    """Get poll details"""
    serializer_class = PollDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Poll.objects.filter(is_public=True)


class PollUpdateView(generics.UpdateAPIView):
    """Update poll (owner only)"""
    serializer_class = PollCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Poll.objects.filter(creator=self.request.user)


class PollDeleteView(generics.DestroyAPIView):
    """Delete poll (owner only)"""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Poll.objects.filter(creator=self.request.user)


class UserPollsView(generics.ListAPIView):
    """Get user's polls"""
    serializer_class = PollListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Poll.objects.filter(creator=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def vote_view(request, poll_id):
    """Vote on a poll"""
    poll = get_object_or_404(Poll, id=poll_id, is_public=True)
    
    if poll.is_expired:
        return Response(
            {'error': 'This poll has expired'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = VoteSerializer(
        data=request.data,
        context={
            'user': request.user if request.user.is_authenticated else None,
            'ip_address': request.META.get('REMOTE_ADDR')
        }
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Vote recorded successfully'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def poll_results_view(request, poll_id):
    """Get poll results"""
    poll = get_object_or_404(Poll, id=poll_id, is_public=True)
    serializer = PollResultsSerializer(poll)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def poll_share_view(request, poll_id):
    """Get poll share link"""
    poll = get_object_or_404(Poll, id=poll_id, creator=request.user)
    
    # In production, you'd use your actual domain
    share_url = f"http://localhost:3000/poll/{poll.id}"
    
    return Response({
        'poll_id': poll.id,
        'share_url': share_url,
        'title': poll.title
    })
