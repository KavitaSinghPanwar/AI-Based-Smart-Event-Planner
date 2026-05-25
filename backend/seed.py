import datetime
from sqlalchemy.orm import Session
import database, models, auth

def seed_db():
    print("Seeding database via SQLAlchemy...")
    
    db = database.SessionLocal()
    try:
        # Create all tables first
        models.Base.metadata.create_all(bind=database.engine)
        
        # 1. Clear existing database tables to avoid conflicts
        db.query(models.Feedback).delete()
        db.query(models.Notification).delete()
        db.query(models.Booking).delete()
        db.query(models.Event).delete()
        db.query(models.User).delete()
        db.commit()

        # 2. Create Users
        users_data = [
            {"username": "admin", "email": "admin@eventai.com", "password": "admin123", "role": "admin"},
            {"username": "organizer", "email": "organizer@eventai.com", "password": "organizer123", "role": "organizer"},
            {"username": "user", "email": "user@eventai.com", "password": "user123", "role": "user"}
        ]
        
        db_users = {}
        for ud in users_data:
            hashed_pwd = auth.get_password_hash(ud["password"])
            user = models.User(
                username=ud["username"],
                email=ud["email"],
                hashed_password=hashed_pwd,
                role=ud["role"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user: {user.username} ({user.role})")
            db_users[ud["role"]] = user

        # 3. Create Events under Organizer
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
                "organizer_id": db_users["organizer"].id
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
                "organizer_id": db_users["organizer"].id
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
                "organizer_id": db_users["organizer"].id
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
                "organizer_id": db_users["organizer"].id
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
                "organizer_id": db_users["organizer"].id
            }
        ]

        for ed in events_data:
            event = models.Event(
                title=ed["title"],
                description=ed["description"],
                category=ed["category"],
                date=ed["date"],
                time=ed["time"],
                city=ed["city"],
                venue=ed["venue"],
                budget=ed["budget"],
                ticket_price=ed["ticket_price"],
                crowd_limit=ed["crowd_limit"],
                organizer_id=ed["organizer_id"]
            )
            db.add(event)
            db.commit()
            print(f"Created event: {event.title}")

        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    seed_db()
