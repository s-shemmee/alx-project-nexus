from django.contrib import admin
from .models import Poll, Option, Vote


class OptionInline(admin.TabularInline):
    model = Option
    extra = 2


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'is_public', 'total_votes', 'is_active', 'created_at')
    list_filter = ('is_public', 'created_at', 'expires_at')
    search_fields = ('title', 'description', 'creator__username')
    inlines = [OptionInline]
    readonly_fields = ('created_at', 'updated_at', 'total_votes')


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('text', 'poll', 'vote_count', 'vote_percentage')
    list_filter = ('poll__creator', 'created_at')
    search_fields = ('text', 'poll__title')


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('option', 'user', 'ip_address', 'created_at')
    list_filter = ('created_at', 'option__poll')
    search_fields = ('user__username', 'ip_address', 'option__text')
