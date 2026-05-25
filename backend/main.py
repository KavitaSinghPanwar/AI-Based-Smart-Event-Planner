import os
import json
import random
from datetime import datetime, date, time
from typing import List, Optional
from io import BytesIO

from fastapi import FastAPI, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func

import database, models, schemas, auth, ai_utils

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="EventAI API Server")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure media directory structure exists
os.makedirs("media/banners", exist_ok=True)
os.makedirs("media/qrcodes", exist_ok=True)

# Mount media static files directory
app.mount("/media", StaticFiles(directory="media"), name="media")

# Helper to format event schema response
def make_event_response(event: models.Event) -> dict:
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "date": event.date,
        "time": event.time,
        "city": event.city,
        "venue": event.venue,
        "budget": event.budget,
        "ticket_price": event.ticket_price,
        "crowd_limit": event.crowd_limit,
        "banner": event.banner,
        "organizer": event.organizer_id,
        "organizer_details": {
            "id": event.organizer.id,
            "username": event.organizer.username,
            "email": event.organizer.email,
            "role": event.organizer.role
        },
        "created_at": event.created_at
    }

# Helper to format booking schema response
def make_booking_response(booking: models.Booking) -> dict:
    return {
        "id": booking.id,
        "user": booking.user_id,
        "user_details": {
            "id": booking.user.id,
            "username": booking.user.username,
            "email": booking.user.email,
            "role": booking.user.role
        },
        "event": booking.event_id,
        "event_details": make_event_response(booking.event),
        "ticket_quantity": booking.ticket_quantity,
        "booking_date": booking.booking_date,
        "total_price": booking.total_price,
        "qr_code_image": booking.qr_code_image,
        "seat_numbers": booking.seat_numbers
    }

# Helper to format feedback schema response
def make_feedback_response(fb: models.Feedback) -> dict:
    return {
        "id": fb.id,
        "user": fb.user_id,
        "user_details": {
            "id": fb.user.id,
            "username": fb.user.username,
            "email": fb.user.email,
            "role": fb.user.role
        },
        "event": fb.event_id,
        "rating": fb.rating,
        "comment": fb.comment,
        "created_at": fb.created_at
    }


# ==========================================
# AUTH ENDPOINTS
# ==========================================

@app.post("/api/auth/register/")
def register(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail={"username": ["A user with that username already exists."]})
        
    db_email = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail={"email": ["A user with that email address already exists."]})
        
    hashed_pwd = auth.get_password_hash(user_data.password)
    user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pwd,
        role=user_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create welcome notification
    welcome_notif = models.Notification(
        user_id=user.id,
        title="Welcome to EventAI! 🚀",
        message="Thank you for signing up. Explore the Event Hub or use our smart AI Planner to get started!"
    )
    db.add(welcome_notif)
    db.commit()

    return {"message": "User registered successfully", "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role}}


@app.post("/api/auth/login/", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == login_data.username).first()
    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    token_data = {"id": user.id, "username": user.username, "email": user.email, "role": user.role}
    access_token = auth.create_access_token(data=token_data)
    
    return {
        "access": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }


@app.get("/api/auth/profile/", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# ==========================================
# EVENTS ENDPOINTS (CRUD + SEARCH/FILTER)
# ==========================================

@app.get("/api/events/")
def list_events(
    category: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Event)
    if category:
        query = query.filter(models.Event.category == category)
    if city:
        query = query.filter(models.Event.city == city)
    if search:
        query = query.filter(
            (models.Event.title.ilike(f"%{search}%")) | 
            (models.Event.description.ilike(f"%{search}%"))
        )
    events = query.order_by(models.Event.created_at.desc()).all()
    return [make_event_response(e) for e in events]


@app.post("/api/events/")
async def create_event(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    city: str = Form(...),
    venue: str = Form(...),
    budget: float = Form(...),
    ticket_price: float = Form(0.00),
    crowd_limit: int = Form(...),
    banner: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in ["admin", "organizer"]:
        raise HTTPException(status_code=430, detail="Only Organizers or Admins can create events.")

    banner_url = None
    if banner:
        file_ext = os.path.splitext(banner.filename)[1]
        banner_filename = f"media/banners/{random.randint(1000, 9999)}_{int(datetime.utcnow().timestamp())}{file_ext}"
        with open(banner_filename, "wb") as buffer:
            buffer.write(await banner.read())
        banner_url = f"/{banner_filename}"

    # Parse date and time
    parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
    # Try different time formats
    try:
        parsed_time = datetime.strptime(time, "%H:%M").time()
    except ValueError:
        parsed_time = datetime.strptime(time, "%H:%M:%S").time()

    event = models.Event(
        title=title,
        description=description,
        category=category,
        date=parsed_date,
        time=parsed_time,
        city=city,
        venue=venue,
        budget=budget,
        ticket_price=ticket_price,
        crowd_limit=crowd_limit,
        banner=banner_url,
        organizer_id=current_user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return make_event_response(event)


@app.get("/api/events/{id}/")
def get_event(id: int, db: Session = Depends(database.get_db)):
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return make_event_response(event)


@app.put("/api/events/{id}/")
async def update_event(
    id: int,
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    city: str = Form(...),
    venue: str = Form(...),
    budget: float = Form(...),
    ticket_price: float = Form(0.00),
    crowd_limit: int = Form(...),
    banner: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this event.")

    # Upload new banner if provided
    if banner:
        file_ext = os.path.splitext(banner.filename)[1]
        banner_filename = f"media/banners/{random.randint(1000, 9999)}_{int(datetime.utcnow().timestamp())}{file_ext}"
        with open(banner_filename, "wb") as buffer:
            buffer.write(await banner.read())
        event.banner = f"/{banner_filename}"

    # Parse date and time
    parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
    try:
        parsed_time = datetime.strptime(time, "%H:%M").time()
    except ValueError:
        parsed_time = datetime.strptime(time, "%H:%M:%S").time()

    event.title = title
    event.description = description
    event.category = category
    event.date = parsed_date
    event.time = parsed_time
    event.city = city
    event.venue = venue
    event.budget = budget
    event.ticket_price = ticket_price
    event.crowd_limit = crowd_limit
    
    db.commit()
    db.refresh(event)
    return make_event_response(event)


@app.delete("/api/events/{id}/")
def delete_event(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this event.")
        
    db.delete(event)
    db.commit()
    return {"detail": "Event deleted successfully"}


# ==========================================
# BOOKINGS ENDPOINTS
# ==========================================

@app.get("/api/bookings/")
def list_bookings(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == "admin":
        bookings = db.query(models.Booking).order_by(models.Booking.booking_date.desc()).all()
    elif current_user.role == "organizer":
        bookings = db.query(models.Booking).join(models.Event).filter(models.Event.organizer_id == current_user.id).order_by(models.Booking.booking_date.desc()).all()
    else:
        bookings = db.query(models.Booking).filter(models.Booking.user_id == current_user.id).order_by(models.Booking.booking_date.desc()).all()
        
    return [make_booking_response(b) for b in bookings]


@app.post("/api/bookings/")
def create_booking(booking_data: schemas.BookingCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    event = db.query(models.Event).filter(models.Event.id == booking_data.event).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    ticket_quantity = booking_data.ticket_quantity
    
    # Calculate current bookings count
    total_booked = db.query(func.sum(models.Booking.ticket_quantity)).filter(models.Booking.event_id == event.id).scalar() or 0
    if total_booked + ticket_quantity > event.crowd_limit:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot book. Only {event.crowd_limit - total_booked} tickets remaining."
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

    # Create booking record
    booking = models.Booking(
        user_id=current_user.id,
        event_id=event.id,
        ticket_quantity=ticket_quantity,
        total_price=total_price,
        seat_numbers=seat_str
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Generate QR Code image file
    import qrcode
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr_data = {
        "booking_id": booking.id,
        "event_title": event.title,
        "date": str(event.date),
        "user": current_user.username,
        "tickets": ticket_quantity,
        "seats": seat_str
    }
    qr.add_data(json.dumps(qr_data))
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    qr_filename = f"media/qrcodes/booking_qr_{booking.id}.png"
    img.save(qr_filename)

    booking.qr_code_image = f"/{qr_filename}"
    db.commit()
    db.refresh(booking)

    # Create Booking Notification
    notif = models.Notification(
        user_id=current_user.id,
        title="Ticket Confirmed! 🎫",
        message=f"You successfully booked {ticket_quantity} ticket(s) for the event '{event.title}'. Your seats are: {seat_str}."
    )
    db.add(notif)
    db.commit()

    return make_booking_response(booking)


# ==========================================
# NOTIFICATIONS ENDPOINTS
# ==========================================

@app.get("/api/notifications/")
def list_notifications(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    notifications = db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).all()
    # Format notifications to match response fields
    return [{
        "id": n.id,
        "user": n.user_id,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at
    } for n in notifications]


@app.post("/api/notifications/mark_all_read/")
def mark_all_read(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({models.Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"detail": "All notifications marked as read."}


# ==========================================
# FEEDBACK ENDPOINTS
# ==========================================

@app.get("/api/feedback/")
def get_feedback(event: Optional[int] = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Feedback)
    if event:
        query = query.filter(models.Feedback.event_id == event)
    feedbacks = query.order_by(models.Feedback.created_at.desc()).all()
    return [make_feedback_response(fb) for fb in feedbacks]


@app.post("/api/feedback/")
def post_feedback(fb_data: schemas.FeedbackCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    event = db.query(models.Event).filter(models.Event.id == fb_data.event).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    feedback = models.Feedback(
        user_id=current_user.id,
        event_id=event.id,
        rating=fb_data.rating,
        comment=fb_data.comment
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return make_feedback_response(feedback)


# ==========================================
# DASHBOARD ENDPOINTS
# ==========================================

@app.get("/api/dashboard/stats/")
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    role = current_user.role
    
    if role == "admin":
        total_users = db.query(models.User).count()
        total_organizers = db.query(models.User).filter(models.User.role == "organizer").count()
        total_events = db.query(models.Event).count()
        total_bookings = db.query(models.Booking).count()
        total_revenue = db.query(func.sum(models.Booking.total_price)).scalar() or 0.0
        
        recent_bookings = db.query(models.Booking).order_by(models.Booking.booking_date.desc()).limit(5).all()
        
        # Category distribution
        category_distribution = db.query(
            models.Event.category,
            func.count(models.Event.id).label("count")
        ).group_by(models.Event.category).all()
        cat_dist = [{"category": row[0], "count": row[1]} for row in category_distribution]
        
        return {
            "role": "admin",
            "stats": {
                "total_users": total_users,
                "total_organizers": total_organizers,
                "total_events": total_events,
                "total_bookings": total_bookings,
                "total_revenue": total_revenue
            },
            "category_distribution": cat_dist,
            "recent_bookings": [make_booking_response(b) for b in recent_bookings]
        }
        
    elif role == "organizer":
        my_events = db.query(models.Event).filter(models.Event.organizer_id == current_user.id)
        total_events = my_events.count()
        
        my_bookings = db.query(models.Booking).join(models.Event).filter(models.Event.organizer_id == current_user.id)
        total_bookings = my_bookings.count()
        total_tickets_sold = db.query(func.sum(models.Booking.ticket_quantity)).join(models.Event).filter(models.Event.organizer_id == current_user.id).scalar() or 0
        total_revenue = db.query(func.sum(models.Booking.total_price)).join(models.Event).filter(models.Event.organizer_id == current_user.id).scalar() or 0.0
        
        recent_bookings = my_bookings.order_by(models.Booking.booking_date.desc()).limit(5).all()
        
        # Group revenue by category for this organizer
        revenue_by_cat = db.query(
            models.Event.category,
            func.sum(models.Booking.total_price).label("revenue"),
            func.count(models.Booking.id).label("bookings_count")
        ).join(models.Booking).filter(models.Event.organizer_id == current_user.id).group_by(models.Event.category).all()
        
        rev_by_cat_list = [{
            "event__category": row[0],
            "revenue": row[1],
            "bookings_count": row[2]
        } for row in revenue_by_cat]
        
        return {
            "role": "organizer",
            "stats": {
                "total_events": total_events,
                "total_bookings": total_bookings,
                "total_tickets_sold": total_tickets_sold,
                "total_revenue": total_revenue
            },
            "revenue_by_category": rev_by_cat_list,
            "recent_bookings": [make_booking_response(b) for b in recent_bookings]
        }
        
    else: # user
        my_bookings = db.query(models.Booking).filter(models.Booking.user_id == current_user.id)
        total_bookings = my_bookings.count()
        total_tickets = db.query(func.sum(models.Booking.ticket_quantity)).filter(models.Booking.user_id == current_user.id).scalar() or 0
        total_spent = db.query(func.sum(models.Booking.total_price)).filter(models.Booking.user_id == current_user.id).scalar() or 0.0
        
        recent_bookings = my_bookings.order_by(models.Booking.booking_date.desc()).limit(5).all()
        
        return {
            "role": "user",
            "stats": {
                "total_bookings": total_bookings,
                "total_tickets": total_tickets,
                "total_spent": total_spent
            },
            "recent_bookings": [make_booking_response(b) for b in recent_bookings]
        }


# ==========================================
# AI PLANNER ENDPOINTS
# ==========================================

@app.post("/api/ai/recommend-venue/")
def ai_recommend_venue(req: schemas.AIRecommendVenueRequest):
    recs = ai_utils.get_venue_recommendations(req.event_type, req.budget, req.city, req.crowd_size)
    return recs

@app.post("/api/ai/predict-crowd/")
def ai_predict_crowd(req: schemas.AIPredictCrowdRequest):
    pred = ai_utils.predict_crowd_turnout(req.event_type, req.category, req.day_of_week, req.ticket_price)
    return pred

@app.post("/api/ai/estimate-budget/")
def ai_estimate_budget(req: schemas.AIEstimateBudgetRequest):
    budget = ai_utils.estimate_event_budget(req.category, req.crowd_size, req.location)
    return budget

@app.post("/api/ai/generate-schedule/")
def ai_generate_schedule(req: schemas.AIGenerateScheduleRequest):
    sched = ai_utils.generate_event_schedule(req.title, req.category, req.date, req.time, req.duration_hours)
    return sched

@app.post("/api/ai/chatbot/")
def ai_chatbot(req: schemas.AIChatbotRequest):
    response_text = ai_utils.get_chatbot_response(req.message, req.history)
    return {"response": response_text}
