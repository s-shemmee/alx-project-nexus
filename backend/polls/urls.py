from django.urls import path
from . import views

urlpatterns = [
    path('', views.PollListView.as_view(), name='poll-list'),
    path('create/', views.PollCreateView.as_view(), name='poll-create'),
    path('<int:pk>/', views.PollDetailView.as_view(), name='poll-detail'),
    path('<int:pk>/update/', views.PollUpdateView.as_view(), name='poll-update'),
    path('<int:pk>/delete/', views.PollDeleteView.as_view(), name='poll-delete'),
    path('my-polls/', views.UserPollsView.as_view(), name='user-polls'),
    path('<int:poll_id>/vote/', views.vote_view, name='poll-vote'),
    path('<int:poll_id>/results/', views.poll_results_view, name='poll-results'),
    path('<int:poll_id>/share/', views.poll_share_view, name='poll-share'),
]
