from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Poll, Option, Vote

User = get_user_model()


class PollModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.poll = Poll.objects.create(
            title='Test Poll',
            description='A test poll',
            creator=self.user,
            is_public=True
        )

    def test_poll_creation(self):
        self.assertEqual(self.poll.title, 'Test Poll')
        self.assertEqual(self.poll.creator, self.user)
        self.assertTrue(self.poll.is_public)

    def test_poll_total_votes(self):
        # Create options and votes
        option1 = Option.objects.create(poll=self.poll, text='Option 1')
        option2 = Option.objects.create(poll=self.poll, text='Option 2')
        
        Vote.objects.create(option=option1, user=self.user)
        Vote.objects.create(option=option2, user=self.user)
        
        self.assertEqual(self.poll.total_votes, 2)


class PollAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.poll = Poll.objects.create(
            title='Test Poll',
            description='A test poll',
            creator=self.user,
            is_public=True
        )
        self.option = Option.objects.create(poll=self.poll, text='Test Option')

    def test_get_public_polls(self):
        url = reverse('poll-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_poll_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('poll-create')
        data = {
            'title': 'New Poll',
            'description': 'A new poll',
            'options': ['Option 1', 'Option 2'],
            'is_public': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_vote_on_poll(self):
        url = reverse('poll-vote', kwargs={'poll_id': self.poll.id})
        data = {'option_id': self.option.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
