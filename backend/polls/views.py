from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Poll, Option, Vote
from .serializers import (
    PollListSerializer, 
    PollDetailSerializer, 
    PollCreateSerializer,
    PollUpdateSerializer,
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
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the created poll with full details including ID
        created_poll = serializer.instance
        response_serializer = PollDetailSerializer(created_poll)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class PollDetailView(generics.RetrieveAPIView):
    """Get poll details"""
    serializer_class = PollDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Allow access to public polls OR polls owned by the authenticated user
        if self.request.user.is_authenticated:
            return Poll.objects.filter(
                Q(is_public=True) | Q(creator=self.request.user)
            )
        else:
            return Poll.objects.filter(is_public=True)
    
    def get_serializer_context(self):
        """Pass request context to serializer for has_voted field"""
        return {'request': self.request}


class PollUpdateView(generics.UpdateAPIView):
    """Update poll (owner only)"""
    serializer_class = PollUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Poll.objects.filter(creator=self.request.user)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return the updated poll with full details
        response_serializer = PollDetailSerializer(instance)
        return Response(response_serializer.data)


class PollDeleteView(generics.DestroyAPIView):
    """Delete poll (owner only)"""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Poll.objects.filter(creator=self.request.user)


class UserPollsView(generics.ListAPIView):
    """Get user's polls"""
    serializer_class = PollDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Poll.objects.filter(creator=self.request.user)
    
    def get_serializer_context(self):
        """Pass request context to serializer for has_voted field"""
        return {'request': self.request}


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def vote_view(request, poll_id):
    """Vote on a poll"""
    # Allow voting on public polls OR polls owned by the authenticated user
    if request.user.is_authenticated:
        poll = get_object_or_404(
            Poll, 
            Q(id=poll_id) & (Q(is_public=True) | Q(creator=request.user))
        )
    else:
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
    # Allow access to public polls OR polls owned by the authenticated user
    if request.user.is_authenticated:
        poll = get_object_or_404(
            Poll, 
            Q(id=poll_id) & (Q(is_public=True) | Q(creator=request.user))
        )
    else:
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
