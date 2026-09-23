from rest_framework import viewsets, permissions
from .models import Subscription
from .serializers import SubscriptionSerializer


class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Isolation: only show subscriptions for workspaces this user belongs to
        return Subscription.objects.filter(workspace__members__user=self.request.user)