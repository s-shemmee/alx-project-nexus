from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Poll, Option, Vote

User = get_user_model()


class OptionSerializer(serializers.ModelSerializer):
    """Serializer for poll options"""
    vote_count = serializers.ReadOnlyField()
    vote_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Option
        fields = ['id', 'text', 'vote_count', 'vote_percentage']


class PollListSerializer(serializers.ModelSerializer):
    """Serializer for poll list view"""
    creator = serializers.StringRelatedField()
    total_votes = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Poll
        fields = ['id', 'title', 'description', 'creator', 'is_public', 
                 'expires_at', 'created_at', 'total_votes', 'is_active', 'is_expired']


class PollDetailSerializer(serializers.ModelSerializer):
    """Serializer for poll detail view"""
    creator = serializers.StringRelatedField()
    options = OptionSerializer(many=True, read_only=True)
    total_votes = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Poll
        fields = ['id', 'title', 'description', 'creator', 'is_public', 
                 'expires_at', 'created_at', 'updated_at', 'options', 
                 'total_votes', 'is_active', 'is_expired']


class PollCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating polls"""
    options = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        min_length=2,
        max_length=10
    )

    class Meta:
        model = Poll
        fields = ['title', 'description', 'is_public', 'expires_at', 'options']

    def create(self, validated_data):
        options_data = validated_data.pop('options')
        poll = Poll.objects.create(**validated_data)
        
        for option_text in options_data:
            Option.objects.create(poll=poll, text=option_text)
        
        return poll


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for voting"""
    option_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Vote
        fields = ['option_id']

    def create(self, validated_data):
        option_id = validated_data.pop('option_id')
        try:
            option = Option.objects.get(id=option_id)
        except Option.DoesNotExist:
            raise serializers.ValidationError("Invalid option ID")
        
        # Get user and IP from context
        user = self.context.get('user')
        ip_address = self.context.get('ip_address')
        
        if not user and not ip_address:
            raise serializers.ValidationError("Authentication required")
        
        # Create or update vote
        vote, created = Vote.objects.update_or_create(
            option=option,
            user=user,
            ip_address=ip_address,
            defaults={'option': option}
        )
        
        return vote


class PollResultsSerializer(serializers.ModelSerializer):
    """Serializer for poll results"""
    options = OptionSerializer(many=True, read_only=True)
    total_votes = serializers.ReadOnlyField()

    class Meta:
        model = Poll
        fields = ['id', 'title', 'description', 'total_votes', 'options', 'is_active']
