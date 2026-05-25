from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, time, datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenUser(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

class TokenResponse(BaseModel):
    access: str
    user: TokenUser

# Event schemas
class EventBase(BaseModel):
    title: str
    description: str
    category: str
    date: date
    time: time
    city: str
    venue: str
    budget: float
    ticket_price: float = 0.00
    crowd_limit: int

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    banner: Optional[str] = None
    organizer: int
    organizer_details: UserResponse
    created_at: datetime
    class Config:
        from_attributes = True

# Booking schemas
class BookingCreate(BaseModel):
    event: int
    ticket_quantity: int = 1

class BookingResponse(BaseModel):
    id: int
    user: int
    user_details: UserResponse
    event: int
    event_details: EventResponse
    ticket_quantity: int
    booking_date: datetime
    total_price: float
    qr_code_image: Optional[str] = None
    seat_numbers: str
    class Config:
        from_attributes = True

# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    user: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Feedback schemas
class FeedbackCreate(BaseModel):
    event: int
    rating: int = 5
    comment: str

class FeedbackResponse(BaseModel):
    id: int
    user: int
    user_details: UserResponse
    event: int
    rating: int
    comment: str
    created_at: datetime
    class Config:
        from_attributes = True

# Stats Response schemas
class CategoryDistributionItem(BaseModel):
    category: str
    count: int

class RevenueByCategoryItem(BaseModel):
    event__category: str
    revenue: float
    bookings_count: int

# AI Request Schemas
class AIRecommendVenueRequest(BaseModel):
    event_type: str
    budget: float
    city: str
    crowd_size: int

class AIPredictCrowdRequest(BaseModel):
    event_type: str
    category: str
    day_of_week: str
    ticket_price: float = 0.00

class AIEstimateBudgetRequest(BaseModel):
    category: str
    crowd_size: int
    location: str

class AIGenerateScheduleRequest(BaseModel):
    title: str
    category: str
    date: str
    time: str
    duration_hours: float

class AIChatbotRequest(BaseModel):
    message: str
    history: List[dict] = []
