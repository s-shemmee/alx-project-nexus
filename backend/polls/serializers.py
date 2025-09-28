from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Poll, Option, Vote

User = get_user_model()


class OptionSerializer(serializers.ModelSerializer):
    """Serializer for poll options"""
    vote_count = serializers.ReadOnlyField()
    vote_percentage = serializers.ReadOnlyField()
    votes = serializers.ReadOnlyField(source='vote_count')  # Alias for frontend compatibility

    class Meta:
        model = Option
        fields = ['id', 'text', 'vote_count', 'vote_percentage', 'votes']


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
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = ['id', 'title', 'description', 'creator', 'is_public', 
                 'expires_at', 'created_at', 'updated_at', 'options', 
                 'total_votes', 'is_active', 'is_expired', 'has_voted']
    
    def get_has_voted(self, obj):
        """Check if the current user has voted in this poll"""
        request = self.context.get('request')
        if not request:
            return False
            
        if request.user.is_authenticated:
            # Check if authenticated user has voted
            from .models import Vote
            return Vote.objects.filter(
                option__poll=obj,
                user=request.user
            ).exists()
        else:
            # Check if IP address has voted
            ip_address = request.META.get('REMOTE_ADDR')
            if ip_address:
                from .models import Vote
                return Vote.objects.filter(
                    option__poll=obj,
                    ip_address=ip_address
                ).exists()
        
        return False


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


class PollUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating polls"""
    options = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        min_length=2,
        max_length=10,
        required=False
    )

    class Meta:
        model = Poll
        fields = ['title', 'description', 'is_public', 'expires_at', 'options']

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        
        # Update poll fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update options if provided
        if options_data is not None:
            # Delete existing options
            instance.options.all().delete()
            
            # Create new options
            for option_text in options_data:
                Option.objects.create(poll=instance, text=option_text)
        
        return instance


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
