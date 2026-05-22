from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    MyTokenObtainPairView,
    RegisterView,
    UserProfileView,
    EventViewSet,
    BookingViewSet,
    DashboardStatsView,
    AIRecommendVenueView,
    AIPredictCrowdView,
    AIEstimateBudgetView,
    AIGenerateScheduleView,
    AIChatbotView
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    # Include router URLS (events/ and bookings/)
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Dashboard stats
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # AI endpoints
    path('ai/recommend-venue/', AIRecommendVenueView.as_view(), name='ai_recommend_venue'),
    path('ai/predict-crowd/', AIPredictCrowdView.as_view(), name='ai_predict_crowd'),
    path('ai/estimate-budget/', AIEstimateBudgetView.as_view(), name='ai_estimate_budget'),
    path('ai/generate-schedule/', AIGenerateScheduleView.as_view(), name='ai_generate_schedule'),
    path('ai/chatbot/', AIChatbotView.as_view(), name='ai_chatbot'),
]
