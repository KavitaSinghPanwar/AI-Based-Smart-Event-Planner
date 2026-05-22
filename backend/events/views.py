import json
from io import BytesIO
import qrcode
import random

from django.core.files import File
from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, Event, Booking
from .serializers import UserSerializer, UserRegisterSerializer, EventSerializer, BookingSerializer
from .ai_utils import (
    get_venue_recommendations,
    predict_crowd_turnout,
    estimate_event_budget,
    generate_event_schedule,
    get_chatbot_response
)

# Custom JWT Serializer to return user info directly upon login
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role
        }
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# User Registration View
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# User Profile View
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# Event ViewSet (CRUD operations with search and filter)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = self.queryset
        category = self.request.query_params.get('category')
        city = self.request.query_params.get('city')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category__iexact=category)
        if city:
            queryset = queryset.filter(city__iexact=city)
        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(description__icontains=search)
            
        return queryset

    def perform_create(self, serializer):
        # Only admin or organizer can create events
        if self.request.user.role not in ['admin', 'organizer']:
            raise permissions.exceptions.PermissionDenied("Only Organizers or Admins can create events.")
        serializer.save(organizer=self.request.user)

    def update(self, request, *args, **kwargs):
        event = self.get_object()
        if request.user.role != 'admin' and event.organizer != request.user:
            return Response({"detail": "You do not have permission to edit this event."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        event = self.get_object()
        if request.user.role != 'admin' and event.organizer != request.user:
            return Response({"detail": "You do not have permission to delete this event."}, status=status.HTTP_430_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


# Booking ViewSet (Book ticket, booking history, QR code generation, seats)
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-booking_date')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return self.queryset
        elif user.role == 'organizer':
            # View all bookings for events organized by this user
            return self.queryset.filter(event__organizer=user)
        else:
            # Regular user views their own bookings
            return self.queryset.filter(user=user)

    def create(self, request, *args, **kwargs):
        event_id = request.data.get('event')
        ticket_quantity = int(request.data.get('ticket_quantity', 1))
        
        event = get_object_or_404(Event, id=event_id)
        
        # Check crowd limit
        total_booked = Booking.objects.filter(event=event).aggregate(Sum('ticket_quantity'))['ticket_quantity__sum'] or 0
        if total_booked + ticket_quantity > event.crowd_limit:
            return Response(
                {"detail": f"Cannot book. Only {event.crowd_limit - total_booked} tickets remaining."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Calculate total price
        total_price = event.ticket_price * ticket_quantity
        
        # Generate Seat numbers (simulated)
        seats = []
        for _ in range(ticket_quantity):
            row = random.choice(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
            num = random.randint(1, 40)
            seats.append(f"{row}-{num}")
        seat_str = ", ".join(seats)
        
        # Create Booking instance
        booking = Booking(
            user=request.user,
            event=event,
            ticket_quantity=ticket_quantity,
            total_price=total_price,
            seat_numbers=seat_str
        )
        booking.save()
        
        # Generate QR Code for the booking
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr_data = {
            "booking_id": booking.id,
            "event_title": event.title,
            "date": str(event.date),
            "user": request.user.username,
            "tickets": ticket_quantity,
            "seats": seat_str
        }
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        blob = BytesIO()
        img.save(blob, 'PNG')
        booking.qr_code_image.save(f"booking_qr_{booking.id}.png", File(blob), save=True)
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Dashboard Statistics API View
class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.role == 'admin':
            total_users = CustomUser.objects.count()
            total_organizers = CustomUser.objects.filter(role='organizer').count()
            total_events = Event.objects.count()
            total_bookings = Booking.objects.count()
            total_revenue = Booking.objects.aggregate(Sum('total_price'))['total_price__sum'] or 0
            
            # Simple recent activity
            recent_bookings = Booking.objects.order_by('-booking_date')[:5]
            recent_bookings_serializer = BookingSerializer(recent_bookings, many=True)
            
            # Category distribution
            category_distribution = Event.objects.values('category').annotate(count=Count('id'))
            
            return Response({
                "role": "admin",
                "stats": {
                    "total_users": total_users,
                    "total_organizers": total_organizers,
                    "total_events": total_events,
                    "total_bookings": total_bookings,
                    "total_revenue": total_revenue
                },
                "category_distribution": category_distribution,
                "recent_bookings": recent_bookings_serializer.data
            })
            
        elif user.role == 'organizer':
            # Events created by organizer
            my_events = Event.objects.filter(organizer=user)
            total_events = my_events.count()
            
            # Bookings for my events
            my_bookings = Booking.objects.filter(event__organizer=user)
            total_bookings = my_bookings.count()
            total_tickets_sold = my_bookings.aggregate(Sum('ticket_quantity'))['ticket_quantity__sum'] or 0
            total_revenue = my_bookings.aggregate(Sum('total_price'))['total_price__sum'] or 0
            
            recent_bookings = my_bookings.order_by('-booking_date')[:5]
            recent_bookings_serializer = BookingSerializer(recent_bookings, many=True)
            
            # Group revenue by category for this organizer
            revenue_by_category = Booking.objects.filter(event__organizer=user).values('event__category').annotate(
                revenue=Sum('total_price'),
                bookings_count=Count('id')
            )
            
            return Response({
                "role": "organizer",
                "stats": {
                    "total_events": total_events,
                    "total_bookings": total_bookings,
                    "total_tickets_sold": total_tickets_sold,
                    "total_revenue": total_revenue
                },
                "revenue_by_category": revenue_by_category,
                "recent_bookings": recent_bookings_serializer.data
            })
            
        else: # Regular user
            my_bookings = Booking.objects.filter(user=user)
            total_bookings = my_bookings.count()
            total_tickets = my_bookings.aggregate(Sum('ticket_quantity'))['ticket_quantity__sum'] or 0
            total_spent = my_bookings.aggregate(Sum('total_price'))['total_price__sum'] or 0
            
            recent_bookings = my_bookings.order_by('-booking_date')[:5]
            recent_bookings_serializer = BookingSerializer(recent_bookings, many=True)
            
            return Response({
                "role": "user",
                "stats": {
                    "total_bookings": total_bookings,
                    "total_tickets": total_tickets,
                    "total_spent": total_spent
                },
                "recent_bookings": recent_bookings_serializer.data
            })


# AI Views
class AIRecommendVenueView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        event_type = request.data.get('event_type')
        budget = request.data.get('budget')
        city = request.data.get('city')
        crowd_size = request.data.get('crowd_size')

        if not all([event_type, budget, city, crowd_size]):
            return Response({"detail": "Missing required fields: event_type, budget, city, crowd_size"}, status=status.HTTP_400_BAD_REQUEST)

        recommendations = get_venue_recommendations(event_type, budget, city, crowd_size)
        return Response(recommendations)


class AIPredictCrowdView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        event_type = request.data.get('event_type')
        category = request.data.get('category')
        day_of_week = request.data.get('day_of_week')
        ticket_price = request.data.get('ticket_price', 0)

        if not all([event_type, category, day_of_week]):
            return Response({"detail": "Missing required fields: event_type, category, day_of_week"}, status=status.HTTP_400_BAD_REQUEST)

        predictions = predict_crowd_turnout(event_type, category, day_of_week, ticket_price)
        return Response(predictions)


class AIEstimateBudgetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        category = request.data.get('category')
        crowd_size = request.data.get('crowd_size')
        location = request.data.get('location')

        if not all([category, crowd_size, location]):
            return Response({"detail": "Missing required fields: category, crowd_size, location"}, status=status.HTTP_400_BAD_REQUEST)

        budget_estimation = estimate_event_budget(category, crowd_size, location)
        return Response(budget_estimation)


class AIGenerateScheduleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get('title')
        category = request.data.get('category')
        date = request.data.get('date')
        time = request.data.get('time')
        duration_hours = request.data.get('duration_hours')

        if not all([title, category, date, time, duration_hours]):
            return Response({"detail": "Missing required fields: title, category, date, time, duration_hours"}, status=status.HTTP_400_BAD_REQUEST)

        schedule = generate_event_schedule(title, category, date, time, duration_hours)
        return Response(schedule)


class AIChatbotView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        history = request.data.get('history', [])

        if not message:
            return Response({"detail": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        response_text = get_chatbot_response(message, history)
        return Response({"response": response_text})
