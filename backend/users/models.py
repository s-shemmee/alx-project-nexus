from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    avatar = models.URLField(blank=True, null=True, help_text="User's avatar URL")
    bio = models.TextField(blank=True, null=True, max_length=500, help_text="User's bio")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
