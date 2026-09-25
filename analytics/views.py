from rest_framework import viewsets, permissions
from .models import Activity
from .serializers import ActivitySerializer
# Create your views here.

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Activity.objects.filter(workspace__members__user=self.request.user)