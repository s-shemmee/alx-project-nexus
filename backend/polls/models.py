from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Poll(models.Model):
    """Represents a single poll"""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="polls")
    is_public = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def is_expired(self):
        """Check if poll has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    @property
    def total_votes(self):
        """Get total number of votes for this poll"""
        return sum(option.votes.count() for option in self.options.all())

    @property
    def is_active(self):
        """Check if poll is still active (not expired)"""
        return not self.is_expired


class Option(models.Model):
    """Represents a poll option"""
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.poll.title} - {self.text}"

    @property
    def vote_count(self):
        """Get number of votes for this option"""
        return self.votes.count()

    @property
    def vote_percentage(self):
        """Get percentage of votes for this option"""
        total_votes = self.poll.total_votes
        if total_votes == 0:
            return 0
        return round((self.vote_count / total_votes) * 100, 2)


class Vote(models.Model):
    """Represents a single vote"""
    option = models.ForeignKey(Option, on_delete=models.CASCADE, related_name="votes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("option", "user"), ("option", "ip_address")]
        ordering = ['-created_at']

    def __str__(self):
        voter = self.user.username if self.user else f"IP: {self.ip_address}"
        return f"{voter} voted for {self.option.text}"

    def save(self, *args, **kwargs):
        """Override save to ensure only one vote per user/IP per poll"""
        if self.user:
            # Check if user already voted in this poll
            existing_vote = Vote.objects.filter(
                option__poll=self.option.poll,
                user=self.user
            ).exclude(pk=self.pk).first()
            if existing_vote:
                # Update existing vote
                existing_vote.option = self.option
                existing_vote.save()
                return
        else:
            # Check if IP already voted in this poll
            existing_vote = Vote.objects.filter(
                option__poll=self.option.poll,
                ip_address=self.ip_address
            ).exclude(pk=self.pk).first()
            if existing_vote:
                # Update existing vote
                existing_vote.option = self.option
                existing_vote.save()
                return
        
        super().save(*args, **kwargs)
