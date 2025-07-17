from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class BookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service: str
    date: str
    time: str
    participants: int
    message: Optional[str] = ""

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    service: str
    date: str
    time: str
    participants: int
    message: Optional[str] = ""
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Game(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    platform: str
    image_url: str
    duration: int  # in minutes
    max_players: int

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

# Email simulation function (replace with real SMTP later)
async def send_confirmation_email(booking_data: dict):
    """Simulate sending confirmation email"""
    try:
        # For now, just log the email (in production, use real SMTP)
        logger.info(f"📧 EMAIL SENT TO: {booking_data['email']}")
        logger.info(f"📧 SUBJECT: VR Booking Confirmation - {booking_data['name']}")
        logger.info(f"📧 BOOKING ID: {booking_data['id']}")
        logger.info(f"📧 SERVICE: {booking_data['service']}")
        logger.info(f"📧 DATE: {booking_data['date']} at {booking_data['time']}")
        logger.info(f"📧 PARTICIPANTS: {booking_data['participants']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

# Sample games data
SAMPLE_GAMES = [
    {
        "id": "1",
        "name": "Half-Life: Alyx",
        "description": "Fight the Combine in this immersive VR adventure",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1657734240343-44afa9402985?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxWUiUyMGhlYWRzZXR8ZW58MHx8fGJsYWNrX2FuZF93aGl0ZXwxNzUyNzQ5MjQ5fDA&ixlib=rb-4.1.0&q=85",
        "duration": 60,
        "max_players": 1
    },
    {
        "id": "2",
        "name": "Beat Saber",
        "description": "Rhythmic VR experience with lightsabers",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1657734240326-8f2ab858a2dd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxWUiUyMGhlYWRzZXR8ZW58MHx8fGJsYWNrX2FuZF93aGl0ZXwxNzUyNzQ5MjQ5fDA&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 1
    },
    {
        "id": "3",
        "name": "Astro Bot",
        "description": "PlayStation VR platformer adventure",
        "platform": "PlayStation",
        "image_url": "https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg",
        "duration": 45,
        "max_players": 1
    },
    {
        "id": "4",
        "name": "Superhot VR",
        "description": "Time moves only when you move",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1493497029755-f49c8e9a8bbe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHx2aXJ0dWFsJTIwcmVhbGl0eXxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTI3NDkyNTd8MA&ixlib=rb-4.1.0&q=85",
        "duration": 45,
        "max_players": 1
    },
    {
        "id": "5",
        "name": "Horizon Call of the Mountain",
        "description": "PlayStation VR2 exclusive adventure",
        "platform": "PlayStation",
        "image_url": "https://images.unsplash.com/photo-1493496553793-56c1aa2cfcea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHx2aXJ0dWFsJTIwcmVhbGl0eXxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTI3NDkyNTd8MA&ixlib=rb-4.1.0&q=85",
        "duration": 60,
        "max_players": 1
    }
]

# Routes
@api_router.get("/")
async def root():
    return {"message": "QNOVA VR Studio API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, background_tasks: BackgroundTasks):
    booking_obj = Booking(**booking_data.dict())
    
    # Save to MongoDB
    await db.bookings.insert_one(booking_obj.dict())
    
    # Send confirmation email in background
    background_tasks.add_task(send_confirmation_email, booking_obj.dict())
    
    return booking_obj

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings():
    bookings = await db.bookings.find().to_list(1000)
    return [Booking(**booking) for booking in bookings]

@api_router.get("/games", response_model=List[Game])
async def get_games(platform: Optional[str] = None):
    games = SAMPLE_GAMES
    if platform:
        games = [game for game in games if game["platform"].lower() == platform.lower()]
    return [Game(**game) for game in games]

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message_data: ContactMessageCreate):
    message_obj = ContactMessage(**message_data.dict())
    await db.contact_messages.insert_one(message_obj.dict())
    return message_obj

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    messages = await db.contact_messages.find().to_list(1000)
    return [ContactMessage(**message) for message in messages]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()