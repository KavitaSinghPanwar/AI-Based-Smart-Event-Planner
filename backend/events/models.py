from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('organizer', 'Organizer'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)

    # Resolve reverse accessor clashes by specifying unique related_names
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class Event(models.Model):
    CATEGORY_CHOICES = (
        ('Wedding', 'Wedding'),
        ('Seminar', 'Seminar'),
        ('Concert', 'Concert'),
        ('College Fest', 'College Fest'),
        ('Corporate Event', 'Corporate Event'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    date = models.DateField()
    time = models.TimeField()
    city = models.CharField(max_length=100)
    venue = models.CharField(max_length=200)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    ticket_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    crowd_limit = models.IntegerField()
    banner = models.ImageField(upload_to='banners/', null=True, blank=True)
    organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='organized_events')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Booking(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    ticket_quantity = models.IntegerField(default=1)
    booking_date = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    qr_code_image = models.ImageField(upload_to='qrcodes/', null=True, blank=True)
    seat_numbers = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Booking {self.id} for {self.event.title} by {self.user.username}"
