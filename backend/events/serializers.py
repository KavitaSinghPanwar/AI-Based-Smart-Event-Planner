from rest_framework import serializers
from .models import CustomUser, Event, Booking

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )
        return user


class EventSerializer(serializers.ModelSerializer):
    organizer_details = UserSerializer(source='organizer', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 'date', 'time',
            'city', 'venue', 'budget', 'ticket_price', 'crowd_limit', 'banner',
            'organizer', 'organizer_details', 'created_at'
        ]
        read_only_fields = ['organizer']


class BookingSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    event_details = EventSerializer(source='event', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_details', 'event', 'event_details',
            'ticket_quantity', 'booking_date', 'total_price',
            'qr_code_image', 'seat_numbers'
        ]
        read_only_fields = ['user', 'qr_code_image', 'total_price', 'seat_numbers']
