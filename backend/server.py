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
import asyncio
from functools import wraps

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Email configuration
GMAIL_USER = os.environ.get('GMAIL_USER')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587

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

def run_sync(func):
    """Decorator to run sync function in thread pool"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, func, *args, **kwargs)
    return wrapper

@run_sync
def send_booking_notification_email(booking_data: dict):
    """Send real email notification to studio owner about new booking"""
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"🎮 New VR Booking: {booking_data['name']}"
        msg['From'] = GMAIL_USER
        msg['To'] = GMAIL_USER
        
        # Create HTML content
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
                    🎮 New VR Session Booking
                </h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #000; margin-top: 0;">Customer Details:</h3>
                    <p><strong>Name:</strong> {booking_data['name']}</p>
                    <p><strong>Email:</strong> {booking_data['email']}</p>
                    <p><strong>Phone:</strong> {booking_data['phone']}</p>
                </div>
                
                <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #000; margin-top: 0;">Booking Details:</h3>
                    <p><strong>Service:</strong> {booking_data['service']}</p>
                    <p><strong>Date:</strong> {booking_data['date']}</p>
                    <p><strong>Time:</strong> {booking_data['time']}</p>
                    <p><strong>Participants:</strong> {booking_data['participants']}</p>
                    <p><strong>Booking ID:</strong> {booking_data['id']}</p>
                    <p><strong>Status:</strong> {booking_data['status']}</p>
                </div>
                
                {f'''
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #000; margin-top: 0;">Customer Message:</h4>
                    <p style="font-style: italic;">"{booking_data['message']}"</p>
                </div>
                ''' if booking_data.get('message') else ''}
                
                <div style="background: #000; color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0;"><strong>QNOVA VR Studio</strong></p>
                    <p style="margin: 5px 0;">Stumpfebiel 4, 37073 Göttingen</p>
                    <p style="margin: 5px 0;">+49 160 96286290</p>
                </div>
                
                <p style="color: #666; font-size: 12px; text-align: center;">
                    This email was sent automatically when a customer booked a session through your website.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version
        text_content = f"""
        🎮 NEW VR SESSION BOOKING

        CUSTOMER DETAILS:
        Name: {booking_data['name']}
        Email: {booking_data['email']}
        Phone: {booking_data['phone']}

        BOOKING DETAILS:
        Service: {booking_data['service']}
        Date: {booking_data['date']}
        Time: {booking_data['time']}
        Participants: {booking_data['participants']}
        Booking ID: {booking_data['id']}
        Status: {booking_data['status']}

        {f"Customer Message: {booking_data['message']}" if booking_data.get('message') else ''}

        QNOVA VR Studio
        Stumpfebiel 4, 37073 Göttingen
        +49 160 96286290
        """
        
        # Attach parts
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"✅ Booking notification email sent successfully to {GMAIL_USER}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to send booking notification email: {str(e)}")
        return False

@run_sync
def send_customer_confirmation_email(booking_data: dict):
    """Send confirmation email to customer"""
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"🎮 Your VR Session Booking Confirmed - QNOVA VR"
        msg['From'] = GMAIL_USER
        msg['To'] = booking_data['email']
        
        # Create HTML content
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
                    🎮 Booking Confirmed - QNOVA VR
                </h2>
                
                <p>Dear {booking_data['name']},</p>
                
                <p>Thank you for booking your VR session with QNOVA VR! Your booking has been confirmed.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #000; margin-top: 0;">Your Booking Details:</h3>
                    <p><strong>Service:</strong> {booking_data['service']}</p>
                    <p><strong>Date:</strong> {booking_data['date']}</p>
                    <p><strong>Time:</strong> {booking_data['time']}</p>
                    <p><strong>Participants:</strong> {booking_data['participants']}</p>
                    <p><strong>Booking ID:</strong> {booking_data['id']}</p>
                </div>
                
                <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #000; margin-top: 0;">Visit Us:</h3>
                    <p><strong>Address:</strong> Stumpfebiel 4, 37073 Göttingen, Germany</p>
                    <p><strong>Phone:</strong> +49 160 96286290</p>
                    <p><strong>Email:</strong> qnovavr.de@gmail.com</p>
                </div>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #000; margin-top: 0;">What to Expect:</h4>
                    <ul>
                        <li>Arrive 10 minutes before your session</li>
                        <li>Comfortable clothing recommended</li>
                        <li>All VR equipment provided</li>
                        <li>Expert guidance throughout your session</li>
                    </ul>
                </div>
                
                <div style="background: #000; color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0;"><strong>QNOVA VR Studio</strong></p>
                    <p style="margin: 5px 0;">Experience the Future of Gaming</p>
                    <p style="margin: 5px 0;">Instagram: @qnova_vr</p>
                </div>
                
                <p>We look forward to seeing you soon!</p>
                
                <p style="color: #666; font-size: 12px;">
                    If you need to change or cancel your booking, please contact us as soon as possible.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version
        text_content = f"""
        🎮 BOOKING CONFIRMED - QNOVA VR

        Dear {booking_data['name']},

        Thank you for booking your VR session with QNOVA VR! Your booking has been confirmed.

        YOUR BOOKING DETAILS:
        Service: {booking_data['service']}
        Date: {booking_data['date']}
        Time: {booking_data['time']}
        Participants: {booking_data['participants']}
        Booking ID: {booking_data['id']}

        VISIT US:
        Address: Stumpfebiel 4, 37073 Göttingen, Germany
        Phone: +49 160 96286290
        Email: qnovavr.de@gmail.com

        WHAT TO EXPECT:
        - Arrive 10 minutes before your session
        - Comfortable clothing recommended
        - All VR equipment provided
        - Expert guidance throughout your session

        We look forward to seeing you soon!

        QNOVA VR Studio
        Experience the Future of Gaming
        Instagram: @qnova_vr
        """
        
        # Attach parts
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"✅ Customer confirmation email sent successfully to {booking_data['email']}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to send customer confirmation email: {str(e)}")
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
    
    # Send notification email to studio owner in background
    background_tasks.add_task(send_booking_notification_email, booking_obj.dict())
    
    # Send confirmation email to customer in background
    background_tasks.add_task(send_customer_confirmation_email, booking_obj.dict())
    
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