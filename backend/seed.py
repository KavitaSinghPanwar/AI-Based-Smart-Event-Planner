import os
import django
import datetime

# Configure django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eventai_backend.settings')
django.setup()

from events.models import CustomUser, Event, Booking

def seed_db():
    print("Seeding database...")
    
    # 1. Create Users
    users_data = [
        {"username": "admin", "email": "admin@eventai.com", "password": "admin123", "role": "admin"},
        {"username": "organizer", "email": "organizer@eventai.com", "password": "organizer123", "role": "organizer"},
        {"username": "user", "email": "user@eventai.com", "password": "user123", "role": "user"}
    ]
    
    users = {}
    for ud in users_data:
        user, created = CustomUser.objects.get_or_create(
            username=ud["username"],
            email=ud["email"],
            defaults={"role": ud["role"]}
        )
        if created or user.check_password(ud["password"]) == False:
            user.set_password(ud["password"])
            user.role = ud["role"]
            user.save()
            print(f"Created user: {user.username} ({user.role})")
        else:
            print(f"User {user.username} already exists.")
        users[ud["role"]] = user

    # 2. Create Events under Organizer
    events_data = [
        {
            "title": "Global Tech Summit 2026",
            "description": "An annual gathering of tech enthusiasts, developers, and industry leaders discussing the future of AI, quantum computing, and Web3.",
            "category": "Seminar",
            "date": datetime.date(2026, 6, 15),
            "time": datetime.time(9, 30),
            "city": "Chicago",
            "venue": "Metropolitan Convention Center",
            "budget": 25000.00,
            "ticket_price": 49.99,
            "crowd_limit": 300,
            "organizer": users["organizer"]
        },
        {
            "title": "Elysian Garden Wedding - Sophia & Liam",
            "description": "An elegant outdoor sunset ceremony and reception surrounded by botanical features and live string quartet music.",
            "category": "Wedding",
            "date": datetime.date(2026, 7, 25),
            "time": datetime.time(16, 0),
            "city": "San Francisco",
            "venue": "Skyline Vista Gardens",
            "budget": 45000.00,
            "ticket_price": 0.00,
            "crowd_limit": 150,
            "organizer": users["organizer"]
        },
        {
            "title": "Neon Symphony - Rock Live Concert",
            "description": "Experience high energy beats, laser lights, and world class bands playing rock and electronic hits live on stage.",
            "category": "Concert",
            "date": datetime.date(2026, 8, 12),
            "time": datetime.time(20, 0),
            "city": "New York",
            "venue": "Madison Square Arena",
            "budget": 85000.00,
            "ticket_price": 85.00,
            "crowd_limit": 1200,
            "organizer": users["organizer"]
        },
        {
            "title": "Spring Carnival & Fest 2026",
            "description": "UCLA campus student festival with food trucks, student performances, art installations, and collaborative group contests.",
            "category": "College Fest",
            "date": datetime.date(2026, 5, 30),
            "time": datetime.time(11, 0),
            "city": "Los Angeles",
            "venue": "Campus Central Lawn",
            "budget": 12000.00,
            "ticket_price": 10.00,
            "crowd_limit": 500,
            "organizer": users["organizer"]
        },
        {
            "title": "Apex Corp Executive Seminar",
            "description": "Strategic alignment meeting, annual financial reporting, and networking dinner for senior partners of Apex Corp.",
            "category": "Corporate Event",
            "date": datetime.date(2026, 6, 8),
            "time": datetime.time(10, 0),
            "city": "New York",
            "venue": "Grand Ballroom Plaza",
            "budget": 35000.00,
            "ticket_price": 150.00,
            "crowd_limit": 100,
            "organizer": users["organizer"]
        }
    ]

    for ed in events_data:
        event, created = Event.objects.get_or_create(
            title=ed["title"],
            defaults={
                "description": ed["description"],
                "category": ed["category"],
                "date": ed["date"],
                "time": ed["time"],
                "city": ed["city"],
                "venue": ed["venue"],
                "budget": ed["budget"],
                "ticket_price": ed["ticket_price"],
                "crowd_limit": ed["crowd_limit"],
                "organizer": ed["organizer"]
            }
        )
        if created:
            print(f"Created event: {event.title}")
        else:
            print(f"Event {event.title} already exists.")

    print("Database seeding completed!")

if __name__ == '__main__':
    seed_db()
