from rest_framework.routers import DefaultRouter
from .views import DeckViewSet, FlashcardViewSet

router = DefaultRouter()
router.register("decks", DeckViewSet, basename="deck")
router.register("cards", FlashcardViewSet, basename="flashcard")

urlpatterns = router.urls