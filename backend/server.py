from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
from functools import wraps
from enum import Enum

# Stripe payment integration
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with production fallback and error handling
def get_mongo_connection():
    # Try environment variable first
    mongo_url = os.environ.get('MONGO_URL', os.environ.get('MONGODB_URL'))
    
    # Fix common MongoDB URL issues
    if mongo_url:
        # Fix broken cluster names
        if 'cluster.mongodb' in mongo_url and 'mongodb.net' not in mongo_url:
            mongo_url = mongo_url.replace('cluster.mongodb', 'qnova.nhw7ruz.mongodb.net')
        
        # Ensure proper format
        if mongo_url.startswith('mongodb+srv://') and not mongo_url.endswith('.mongodb.net'):
            if 'qnova' in mongo_url:
                mongo_url = 'mongodb+srv://qnovavrde:jQDX7dRPJPINVhFs@qnova.nhw7ruz.mongodb.net/?retryWrites=true&w=majority&appName=Qnova'
    
    # Fallback to working connection
    if not mongo_url or 'cluster.mongodb' in mongo_url:
        mongo_url = 'mongodb+srv://qnovavrde:jQDX7dRPJPINVhFs@qnova.nhw7ruz.mongodb.net/?retryWrites=true&w=majority&appName=Qnova'
    
    return mongo_url

mongo_url = get_mongo_connection()
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'qnova_vr')
db = client[db_name]

# Log the connection for debugging
import logging
logging.info(f"Connecting to MongoDB with URL: {mongo_url[:50]}...")

# Email configuration
GMAIL_USER = os.environ.get('GMAIL_USER', 'qnovavr.de@gmail.com')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587

# Create the main app without a prefix
app = FastAPI(
    title="QNOVA VR API",
    description="API for QNOVA VR booking and management system",
    version="1.0.0"
)

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    selectedGame: Optional[str] = ""

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
    selectedGame: Optional[str] = ""
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

# Calendar System Models
class SlotStatus(str, Enum):
    available = "available"
    booked = "booked" 
    maintenance = "maintenance"
    blocked = "blocked"

class TimeSlot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    service_type: str  # KAT VR Gaming Session, PlayStation 5 VR Experience, etc.
    status: SlotStatus = SlotStatus.available
    booking_id: Optional[str] = None
    customer_info: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TimeSlotCreate(BaseModel):
    date: str
    time: str
    service_type: str
    status: SlotStatus = SlotStatus.available

class TimeSlotUpdate(BaseModel):
    status: Optional[SlotStatus] = None
    booking_id: Optional[str] = None
    customer_info: Optional[dict] = None

class CalendarDay(BaseModel):
    date: str
    slots: List[TimeSlot]
    total_slots: int
    available_slots: int
    booked_slots: int

# Payment models
class PaymentPackage(BaseModel):
    id: str
    name: str
    price: float  # in EUR
    currency: str = "EUR"  
    description: str
    service_type: str
    duration_minutes: int

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    package_id: str
    amount: float
    currency: str
    payment_status: str  # pending, paid, failed, expired
    metadata: Optional[Dict] = None
    user_email: Optional[str] = None
    booking_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentRequest(BaseModel):
    package_id: str
    origin_url: str
    booking_data: Optional[Dict] = None  # For linking payment to booking

class PaymentStatus(BaseModel):
    session_id: str
    status: str
    payment_status: str
    amount_total: float
    currency: str
    metadata: Dict

# Define VR session pricing packages
VR_PACKAGES = {
    "kat_vr_30min": PaymentPackage(
        id="kat_vr_30min",
        name="KAT VR Gaming Session",
        price=25.0,
        currency="EUR",
        description="30-minute VR gaming session with KAT VR treadmill technology",
        service_type="KAT VR Gaming Session",
        duration_minutes=30
    ),
    "kat_vr_group": PaymentPackage(
        id="kat_vr_group", 
        name="Group KAT VR Party",
        price=80.0,
        currency="EUR",
        description="Group VR party with KAT VR technology (up to 4 people)",
        service_type="Group KAT VR Party",
        duration_minutes=30
    ),
    "playstation_1hr": PaymentPackage(
        id="playstation_1hr",
        name="PlayStation VR Experience", 
        price=35.0,
        currency="EUR",
        description="1-hour PlayStation VR gaming session",
        service_type="PlayStation 5 VR Experience", 
        duration_minutes=60
    ),
    "playstation_premium": PaymentPackage(
        id="playstation_premium",
        name="Premium PlayStation Experience",
        price=120.0, 
        currency="EUR",
        description="Premium PlayStation VR session with latest games",
        service_type="Premium PlayStation VR Experience",
        duration_minutes=60
    )
}

def run_sync(func):
    """Decorator to run sync function in thread pool"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, func, *args, **kwargs)
    return wrapper

def get_service_duration(service_name: str) -> tuple:
    """Get service duration based on service type - returns (english_duration, german_duration)"""
    if "PlayStation" in service_name or "PS" in service_name:
        return ("1 hour", "1 Stunde")
    else:  # KAT VR services
        return ("30 minutes", "30 Minuten")

@run_sync
def send_booking_notification_email(booking_data: dict):
    """Send booking notification with multiple fallback methods"""
    try:
        # Get service duration
        english_duration, german_duration = get_service_duration(booking_data['service'])
        
        # Try Gmail SMTP first
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
                    {f'<p><strong>Selected Game:</strong> 🎮 {booking_data["selectedGame"]}</p>' if booking_data.get('selectedGame') else ''}
                    <p><strong>Service:</strong> {booking_data['service']} ({english_duration})</p>
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
        Service: {booking_data['service']} ({english_duration})
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
        logger.error(f"❌ Gmail SMTP failed: {str(e)}")
        
        # FALLBACK: Log detailed booking notification for manual checking
        logger.info("=" * 80)
        logger.info("🎮 NEW VR BOOKING NOTIFICATION (EMAIL FAILED - CHECK MANUALLY)")
        logger.info("=" * 80)
        logger.info(f"📧 NOTIFICATION FOR: {GMAIL_USER}")
        logger.info(f"👤 CUSTOMER: {booking_data['name']}")
        logger.info(f"📞 PHONE: {booking_data['phone']}")
        logger.info(f"📧 EMAIL: {booking_data['email']}")
        logger.info(f"🎮 SERVICE: {booking_data['service']}")
        logger.info(f"📅 DATE: {booking_data['date']}")
        logger.info(f"🕐 TIME: {booking_data['time']}")
        logger.info(f"👥 PARTICIPANTS: {booking_data['participants']}")
        logger.info(f"🆔 BOOKING ID: {booking_data['id']}")
        logger.info(f"📝 STATUS: {booking_data['status']}")
        if booking_data.get('message'):
            logger.info(f"💬 MESSAGE: {booking_data['message']}")
        logger.info("=" * 80)
        logger.info("⚠️  EMAIL FAILED - BOOKING DETAILS LOGGED ABOVE")
        logger.info("⚠️  CHECK BACKEND LOGS FOR ALL BOOKING NOTIFICATIONS")
        logger.info("=" * 80)
        
        return False

@run_sync
def send_customer_confirmation_email(booking_data: dict):
    """Send confirmation email to customer in German"""
    try:
        # Get service duration
        english_duration, german_duration = get_service_duration(booking_data['service'])
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"🎮 Ihre VR-Session Buchung bestätigt - QNOVA VR"
        msg['From'] = GMAIL_USER
        msg['To'] = booking_data['email']
        
        # Create HTML content in German
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
                    🎮 Buchung bestätigt - QNOVA VR
                </h2>
                
                <p>Liebe/r {booking_data['name']},</p>
                
                <p>vielen Dank für Ihre VR-Session Buchung bei QNOVA VR! Ihre Buchung wurde bestätigt.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #000; margin-top: 0;">Ihre Buchungsdetails:</h3>
                    {f'<p><strong>Ausgewähltes Spiel:</strong> 🎮 {booking_data["selectedGame"]}</p>' if booking_data.get('selectedGame') else ''}
                    <p><strong>Service:</strong> {booking_data['service']} ({german_duration})</p>
                    <p><strong>Datum:</strong> {booking_data['date']}</p>
                    <p><strong>Uhrzeit:</strong> {booking_data['time']}</p>
                    <p><strong>Teilnehmer:</strong> {booking_data['participants']}</p>
                    <p><strong>Buchungs-ID:</strong> {booking_data['id']}</p>
                </div>
                
                <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #000; margin-top: 0;">Besuchen Sie uns:</h3>
                    <p><strong>Adresse:</strong> Stumpfebiel 4, 37073 Göttingen, Deutschland</p>
                    <p><strong>Telefon:</strong> +49 160 96286290</p>
                    <p><strong>E-Mail:</strong> qnovavr.de@gmail.com</p>
                </div>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #000; margin-top: 0;">Was Sie erwartet:</h4>
                    <ul>
                        <li>Kommen Sie 10 Minuten vor Ihrer Session</li>
                        <li>Bequeme Kleidung empfohlen</li>
                        <li>Alle VR-Ausrüstung wird gestellt</li>
                        <li>Expertenbetreuung während der gesamten Session</li>
                    </ul>
                </div>
                
                <div style="background: #000; color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0;"><strong>QNOVA VR Studio</strong></p>
                    <p style="margin: 5px 0;">Erleben Sie die Zukunft des Gamings</p>
                    <p style="margin: 5px 0;">Instagram: @qnova_vr</p>
                </div>
                
                <p>Wir freuen uns darauf, Sie bald zu sehen!</p>
                
                <p style="color: #666; font-size: 12px;">
                    Falls Sie Ihre Buchung ändern oder stornieren möchten, kontaktieren Sie uns bitte so schnell wie möglich.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version in German
        text_content = f"""
        🎮 BUCHUNG BESTÄTIGT - QNOVA VR

        Liebe/r {booking_data['name']},

        vielen Dank für Ihre VR-Session Buchung bei QNOVA VR! Ihre Buchung wurde bestätigt.

        IHRE BUCHUNGSDETAILS:
        Service: {booking_data['service']} ({german_duration})
        Datum: {booking_data['date']}
        Uhrzeit: {booking_data['time']}
        Teilnehmer: {booking_data['participants']}
        Buchungs-ID: {booking_data['id']}

        BESUCHEN SIE UNS:
        Adresse: Stumpfebiel 4, 37073 Göttingen, Deutschland
        Telefon: +49 160 96286290
        E-Mail: qnovavr.de@gmail.com

        WAS SIE ERWARTET:
        - Kommen Sie 10 Minuten vor Ihrer Session
        - Bequeme Kleidung empfohlen
        - Alle VR-Ausrüstung wird gestellt
        - Expertenbetreuung während der gesamten Session

        Wir freuen uns darauf, Sie bald zu sehen!

        QNOVA VR Studio
        Erleben Sie die Zukunft des Gamings
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

@run_sync
def send_contact_notification_email(contact_data):
    """Send email notification when someone submits contact form"""
    try:
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"📧 New Contact Message from {contact_data['name']} - QNOVA VR"
        msg['From'] = GMAIL_USER
        msg['To'] = GMAIL_USER  # Send to studio owner

        # Process message for HTML display
        message_html = contact_data['message'].replace('\n', '<br>')
        
        # HTML email body
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>New Contact Message</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">📧 New Contact Message</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">QNOVA Virtual Reality Studio</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
                    <h2 style="color: #000; margin-top: 0;">Contact Details:</h2>
                    <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Name:</strong> {contact_data['name']}</p>
                        <p><strong>Email:</strong> <a href="mailto:{contact_data['email']}">{contact_data['email']}</a></p>
                        <p><strong>Subject:</strong> {contact_data['subject']}</p>
                        <p><strong>Message:</strong></p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #000;">
                            {message_html}
                        </div>
                    </div>
                    
                    <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #000; margin-top: 0;">Next Steps:</h3>
                        <p style="margin: 5px 0;">• Reply to customer at: <a href="mailto:{contact_data['email']}">{contact_data['email']}</a></p>
                        <p style="margin: 5px 0;">• Response time target: Within 24 hours</p>
                        <p style="margin: 5px 0;">• Message received: {datetime.now().strftime('%Y-%m-%d at %H:%M')}</p>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <div style="text-align: center; color: #666; font-size: 14px;">
                        <p style="margin: 0;">QNOVA Virtual Reality Studio</p>
                        <p style="margin: 5px 0;">Stumpfebiel 4, 37073 Göttingen</p>
                        <p style="margin: 5px 0;">📞 +49 160 96286290 | 📧 qnovavr.de@gmail.com</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        # Attach HTML body
        html_part = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(html_part)

        # Send email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        
        print(f"Contact notification email sent successfully for: {contact_data['name']}")
        return True

    except Exception as e:
        print(f"Failed to send contact notification email: {str(e)}")
        return False

# Sample games data with authentic game covers and functional booking
SAMPLE_GAMES = [
    # KAT VR Games
    {
        "id": "1",
        "name": "Half-Life: Alyx",
        "description": "Premium VR experience with stunning graphics and immersive gameplay",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxnYW1pbmd8ZW58MHx8fHwxNzUyOTQxNTA1fDA&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 1
    },
    {
        "id": "2",
        "name": "Pavlov VR",
        "description": "Multiplayer shooter with realistic gun mechanics and tactical gameplay",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxnYW1pbmd8ZW58MHx8fHwxNzUyOTQxNTA1fDA&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 4
    },
    {
        "id": "3",
        "name": "Beat Saber",
        "description": "Rhythm game perfect for all ages - slice beats with lightsabers",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxnYW1pbmd8ZW58MHx8fHwxNzUyOTQxNTA1fDA&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 1
    },
    {
        "id": "4",
        "name": "Skyrim VR",
        "description": "Open-world adventure in the legendary Elder Scrolls universe",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1554410637-1a8267402b57?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHx2aWRlbyUyMGdhbWVzfGVufDB8fHx8MTc1Mjk0MTQ5OHww&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 1
    },
    {
        "id": "5",
        "name": "Boneworks",
        "description": "Physics-based VR with realistic interaction and combat systems",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWVzfGVufDB8fHx8MTc1Mjk0MTQ5OHww&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 1
    },
    {
        "id": "6",
        "name": "The Walking Dead: Saints & Sinners",
        "description": "Survival horror VR experience in the zombie apocalypse",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1507457379470-08b800bebc67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHx2aWRlbyUyMGdhbWVzfGVufDB8fHx8MTc1Mjk0MTQ5OHww&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 1
    },
    {
        "id": "7",
        "name": "Superhot VR",
        "description": "Time manipulation shooter - time moves only when you move",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1705623337600-0ed65024022f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxnYW1lJTIwY292ZXJzfGVufDB8fHx8MTc1Mjk0MTQ2Nnww&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 1
    },
    {
        "id": "8",
        "name": "Arizona Sunshine",
        "description": "Zombie shooter with co-op gameplay and desert environments",
        "platform": "VR",
        "image_url": "https://images.unsplash.com/photo-1543622748-5ee7237e8565?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxnYW1lJTIwY292ZXJzfGVufDB8fHx8MTc1Mjk0MTQ2Nnww&ixlib=rb-4.1.0&q=85",
        "duration": 30,
        "max_players": 2
    },
    # PlayStation Games with your CORRECT game covers
    {
        "id": "9",
        "name": "Call of Duty: Modern Warfare III", 
        "description": "Latest installment in the popular FPS franchise with campaign and multiplayer",
        "platform": "PlayStation",
        "image_url": "https://i.imgur.com/qkrEXep.png",
        "duration": 60,
        "max_players": 4
    },
    {
        "id": "10",
        "name": "FIFA 25",
        "description": "Latest football simulation with realistic gameplay and updated rosters",
        "platform": "PlayStation",
        "image_url": "https://i.imgur.com/9ZbaSE2.jpeg",
        "duration": 60,
        "max_players": 2
    },
    {
        "id": "11",
        "name": "UFC 5",
        "description": "Ultimate fighting experience with realistic combat mechanics",
        "platform": "PlayStation",
        "image_url": "https://i.imgur.com/4bEFjBb.jpeg",
        "duration": 60,
        "max_players": 2
    },
    {
        "id": "12",
        "name": "Gran Turismo 7",
        "description": "Premium racing simulation with stunning graphics and realistic physics",
        "platform": "PlayStation",
        "image_url": "https://i.imgur.com/mRP0p1M.jpeg",
        "duration": 60,
        "max_players": 2
    },
    {
        "id": "13",
        "name": "Grand Theft Auto V",
        "description": "Open-world action adventure game with online multiplayer modes",
        "platform": "PlayStation",
        "image_url": "https://i.imgur.com/KYvktmc.png",
        "duration": 60,
        "max_players": 4
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
    
    # Send email notification to studio owner
    try:
        await send_contact_notification_email(message_obj.dict())
    except Exception as e:
        print(f"Failed to send contact notification email: {str(e)}")
    
    return message_obj

# =================== CALENDAR SYSTEM ENDPOINTS ===================

@api_router.get("/calendar/{date}", response_model=CalendarDay)
async def get_calendar_day(date: str):
    """Get all time slots for a specific date (YYYY-MM-DD format)"""
    try:
        # Get all slots for the date
        slots_cursor = db.time_slots.find({"date": date})
        slots = []
        async for slot in slots_cursor:
            slots.append(TimeSlot(**slot))
        
        # Sort slots by time
        slots.sort(key=lambda x: x.time)
        
        # Generate missing slots if needed
        if not slots:
            slots = await generate_default_slots_for_date(date)
        
        # Calculate statistics
        total_slots = len(slots)
        available_slots = len([s for s in slots if s.status == SlotStatus.available])
        booked_slots = len([s for s in slots if s.status == SlotStatus.booked])
        
        return CalendarDay(
            date=date,
            slots=slots,
            total_slots=total_slots,
            available_slots=available_slots,
            booked_slots=booked_slots
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/calendar/range/{start_date}/{end_date}")
async def get_calendar_range(start_date: str, end_date: str):
    """Get calendar data for a date range"""
    try:
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        days = []
        current = start
        while current <= end:
            date_str = current.strftime("%Y-%m-%d")
            day_data = await get_calendar_day(date_str)
            days.append(day_data)
            current += timedelta(days=1)
        
        return {"days": days, "start_date": start_date, "end_date": end_date}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/calendar/slots", response_model=TimeSlot)
async def create_time_slot(slot_data: TimeSlotCreate):
    """Create a new time slot"""
    try:
        slot = TimeSlot(**slot_data.dict())
        await db.time_slots.insert_one(slot.dict())
        return slot
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.put("/calendar/slots/{slot_id}", response_model=TimeSlot)
async def update_time_slot(slot_id: str, slot_update: TimeSlotUpdate):
    """Update a time slot (book, cancel, maintenance, etc.)"""
    try:
        update_data = {k: v for k, v in slot_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.time_slots.update_one(
            {"id": slot_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Time slot not found")
        
        # Get updated slot
        updated_slot = await db.time_slots.find_one({"id": slot_id})
        return TimeSlot(**updated_slot)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/calendar/slots/{slot_id}")
async def delete_time_slot(slot_id: str):
    """Delete a time slot"""
    try:
        result = await db.time_slots.delete_one({"id": slot_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Time slot not found")
        return {"message": "Time slot deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/calendar/book-slot/{slot_id}")
async def book_time_slot(slot_id: str, booking_info: dict):
    """Book a specific time slot"""
    try:
        # Check if slot exists and is available
        slot = await db.time_slots.find_one({"id": slot_id})
        if not slot:
            raise HTTPException(status_code=404, detail="Time slot not found")
        
        if slot["status"] != SlotStatus.available:
            raise HTTPException(status_code=400, detail="Time slot is not available")
        
        # Create booking
        booking_data = {
            "id": str(uuid.uuid4()),
            "name": booking_info["name"],
            "email": booking_info["email"],
            "phone": booking_info.get("phone", ""),
            "service": slot["service_type"],
            "date": slot["date"],
            "time": slot["time"],
            "participants": booking_info.get("participants", 1),
            "message": booking_info.get("message", ""),
            "selectedGame": booking_info.get("selectedGame", ""),
            "status": "confirmed",
            "created_at": datetime.utcnow()
        }
        
        # Save booking
        await db.bookings.insert_one(booking_data)
        
        # Update slot status
        await db.time_slots.update_one(
            {"id": slot_id},
            {
                "$set": {
                    "status": SlotStatus.booked,
                    "booking_id": booking_data["id"],
                    "customer_info": {
                        "name": booking_info["name"],
                        "email": booking_info["email"],
                        "phone": booking_info.get("phone", "")
                    },
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Send email notifications
        try:
            await send_booking_notification_email(booking_data)
            await send_customer_confirmation_email(booking_data)
        except Exception as e:
            print(f"Email notification failed: {str(e)}")
        
        return {"message": "Time slot booked successfully", "booking_id": booking_data["id"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/calendar/generate-slots/{date}")
async def generate_slots_for_date(date: str):
    """Generate default time slots for a specific date"""
    try:
        slots = await generate_default_slots_for_date(date)
        return {"message": f"Generated {len(slots)} slots for {date}", "slots": slots}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =================== ADMIN FUNCTIONS ===================

@api_router.get("/admin/bookings/today")
async def get_today_bookings():
    """Get all bookings for today"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        bookings_cursor = db.bookings.find({"date": today})
        bookings = []
        async for booking in bookings_cursor:
            bookings.append(booking)
        return {"date": today, "bookings": bookings, "count": len(bookings)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/admin/test-mode/create-bookings")
async def create_test_bookings():
    """Create test bookings for demonstration"""
    try:
        today = datetime.now()
        test_bookings = []
        
        # Create 5 test bookings over next 3 days
        for i in range(5):
            date = (today + timedelta(days=i % 3)).strftime("%Y-%m-%d")
            time = f"{12 + i}:{'00' if i % 2 == 0 else '30'}"
            
            # Create time slot if doesn't exist
            slot = TimeSlot(
                date=date,
                time=time,
                service_type="KAT VR Gaming Session" if i % 2 == 0 else "PlayStation 5 VR Experience",
                status=SlotStatus.booked,
                booking_id=f"test_{i}",
                customer_info={
                    "name": f"Test Customer {i+1}",
                    "email": f"test{i+1}@example.com",
                    "phone": f"+49 123 45678{i}"
                }
            )
            await db.time_slots.insert_one(slot.dict())
            test_bookings.append(slot)
        
        return {"message": "Test bookings created", "bookings": len(test_bookings)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/admin/test-mode/clear-test-data")
async def clear_test_data():
    """Clear all test bookings and slots"""
    try:
        # Remove test slots
        result1 = await db.time_slots.delete_many({"customer_info.name": {"$regex": "^Test Customer"}})
        
        # Remove test bookings  
        result2 = await db.bookings.delete_many({"name": {"$regex": "^Test Customer"}})
        
        return {
            "message": "Test data cleared",
            "deleted_slots": result1.deleted_count,
            "deleted_bookings": result2.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/availability/{date}")
async def check_availability(date: str, service: Optional[str] = None):
    """Check availability for a specific date and optionally filter by service type"""
    try:
        # Generate time slots based on service type
        if service and service.lower().find('playstation') != -1:
            # PlayStation sessions: 1-hour intervals from 12:00-22:00
            time_slots = []
            for hour in range(12, 22):
                time_slots.append(f"{hour:02d}:00")
        else:
            # KAT VR sessions: 30-minute intervals from 12:00-21:30
            time_slots = []
            for hour in range(12, 22):
                time_slots.append(f"{hour:02d}:00")
                if hour < 21:
                    time_slots.append(f"{hour:02d}:30")
        
        # Check existing bookings for this date
        bookings_cursor = db.bookings.find({"date": date})
        booked_times = []
        async for booking in bookings_cursor:
            booked_times.append(booking.get("time", ""))
        
        # Create availability response
        available_slots = []
        for time_slot in time_slots:
            is_available = time_slot not in booked_times
            available_slots.append({
                "time": time_slot,
                "available": is_available,
                "status": "available" if is_available else "booked"
            })
        
        return {
            "date": date,
            "service": service or "all",
            "slots": available_slots,
            "total_slots": len(available_slots),
            "available_count": len([s for s in available_slots if s["available"]]),
            "booked_count": len([s for s in available_slots if not s["available"]])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def generate_default_slots_for_date(date: str) -> List[TimeSlot]:
    """Generate default time slots for a specific date"""
    slots = []
    
    # Define default time slots (9 AM to 9 PM, 30-minute intervals)
    start_hour = 9
    end_hour = 21
    
    for hour in range(start_hour, end_hour):
        for minute in [0, 30]:
            time_str = f"{hour:02d}:{minute:02d}"
            
            # Create KAT VR slot
            kat_slot = TimeSlot(
                date=date,
                time=time_str,
                service_type="KAT VR Gaming Session",
                status=SlotStatus.available
            )
            slots.append(kat_slot)
            
            # Create PlayStation slot (1-hour sessions, so only on the hour)
            if minute == 0:
                ps_slot = TimeSlot(
                    date=date,
                    time=time_str,
                    service_type="PlayStation 5 VR Experience",
                    status=SlotStatus.available
                )
                slots.append(ps_slot)
    
    # Save slots to database
    for slot in slots:
        await db.time_slots.insert_one(slot.dict())
    
    return slots

@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring services"""
    try:
        # Test database connection
        server_info = await client.admin.command("ismaster")
        
        return {
            "status": "healthy",
            "service": "QNOVA VR Backend API",
            "timestamp": datetime.now().isoformat(),
            "database": "connected",
            "version": "1.0.0",
            "database_status": "ok"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "QNOVA VR Backend API", 
            "timestamp": datetime.now().isoformat(),
            "database": "disconnected",
            "error": str(e),
            "version": "1.0.0"
        }

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    messages = await db.contact_messages.find().to_list(1000)
    return [ContactMessage(**message) for message in messages]

async def generate_default_slots_for_date(date: str) -> List[TimeSlot]:
    """Generate default time slots for a specific date"""
    slots = []
    
    # Define default time slots (12:00 to 22:00, following existing pattern)
    start_hour = 12
    end_hour = 22
    
    for hour in range(start_hour, end_hour):
        for minute in [0, 30]:
            time_str = f"{hour:02d}:{minute:02d}"
            
            # Create KAT VR slot (30-minute sessions)
            kat_slot = TimeSlot(
                date=date,
                time=time_str,
                service_type="KAT VR Gaming Session",
                status=SlotStatus.available
            )
            slots.append(kat_slot)
            await db.time_slots.insert_one(kat_slot.dict())
            
        # Create PlayStation slot for each hour (1-hour sessions)
        hour_time_str = f"{hour:02d}:00"
        ps_slot = TimeSlot(
            date=date,
            time=hour_time_str,
            service_type="PlayStation 5 VR Experience",
            status=SlotStatus.available
        )
        slots.append(ps_slot)
        await db.time_slots.insert_one(ps_slot.dict())
    
    return slots

# =================== PAYMENT ENDPOINTS ===================

# Initialize Stripe Checkout (will be initialized in endpoints)
stripe_checkout = None

def init_stripe_checkout(request: Request):
    """Initialize Stripe checkout with webhook URL"""
    global stripe_checkout
    if not stripe_checkout:
        api_key = os.environ.get('STRIPE_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    return stripe_checkout

@api_router.get("/packages")
async def get_payment_packages():
    """Get all available VR session packages"""
    return {"packages": list(VR_PACKAGES.values())}

@api_router.post("/payments/create-session")
async def create_payment_session(payment_request: PaymentRequest, request: Request):
    """Create a Stripe checkout session for VR booking payment"""
    try:
        # Validate package exists
        if payment_request.package_id not in VR_PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package ID")
        
        package = VR_PACKAGES[payment_request.package_id]
        
        # Initialize Stripe checkout
        checkout = init_stripe_checkout(request)
        
        # Build success and cancel URLs from origin
        success_url = f"{payment_request.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{payment_request.origin_url}/booking"
        
        # Create metadata with package and booking info
        metadata = {
            "package_id": payment_request.package_id,
            "package_name": package.name,
            "service_type": package.service_type,
            "duration_minutes": str(package.duration_minutes)
        }
        
        # Add booking data if provided
        if payment_request.booking_data:
            metadata.update({
                "customer_email": payment_request.booking_data.get("email", ""),
                "customer_name": payment_request.booking_data.get("name", ""),
                "booking_date": payment_request.booking_data.get("date", ""),
                "booking_time": payment_request.booking_data.get("time", "")
            })
        
        # Create checkout session request
        checkout_request = CheckoutSessionRequest(
            amount=package.price,
            currency=package.currency.lower(),
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        # Create session with Stripe
        session = await checkout.create_checkout_session(checkout_request)
        
        # Store payment transaction in database
        transaction = PaymentTransaction(
            session_id=session.session_id,
            package_id=payment_request.package_id,
            amount=package.price,
            currency=package.currency,
            payment_status="pending",
            metadata=metadata,
            user_email=payment_request.booking_data.get("email") if payment_request.booking_data else None,
            booking_id=payment_request.booking_data.get("booking_id") if payment_request.booking_data else None
        )
        
        # Save to MongoDB
        await db.payment_transactions.insert_one(transaction.dict())
        
        return {
            "url": session.url,
            "session_id": session.session_id,
            "package": package.dict(),
            "amount": package.price,
            "currency": package.currency
        }
        
    except Exception as e:
        logger.error(f"Error creating payment session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create payment session: {str(e)}")

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    """Get the status of a payment session"""
    try:
        # Initialize Stripe checkout
        checkout = init_stripe_checkout(request)
        
        # Get status from Stripe
        status_response = await checkout.get_checkout_status(session_id)
        
        # Find transaction in database
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Payment transaction not found")
        
        # Update transaction status if payment is complete and not already processed
        if status_response.payment_status == "paid" and transaction.get("payment_status") != "paid":
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": "paid",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Here we would typically create the actual booking or update booking status
            # For now, we'll just log the successful payment
            logger.info(f"Payment completed for session {session_id}, amount: {status_response.amount_total/100} {status_response.currency}")
        
        return PaymentStatus(
            session_id=session_id,
            status=status_response.status,
            payment_status=status_response.payment_status,
            amount_total=status_response.amount_total / 100,  # Convert from cents
            currency=status_response.currency.upper(),
            metadata=status_response.metadata
        )
        
    except Exception as e:
        logger.error(f"Error getting payment status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get payment status: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        # Get request body and signature
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        # Initialize Stripe checkout
        checkout = init_stripe_checkout(request)
        
        # Handle webhook
        webhook_response = await checkout.handle_webhook(body, signature)
        
        # Process successful payment
        if webhook_response.event_type == "checkout.session.completed" and webhook_response.payment_status == "paid":
            # Update transaction status
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {
                    "$set": {
                        "payment_status": "paid",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Log successful payment
            logger.info(f"Webhook processed: Payment completed for session {webhook_response.session_id}")
        
        return {"status": "success", "event_id": webhook_response.event_id}
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

@api_router.get("/payments/transactions")
async def get_payment_transactions(limit: int = 50):
    """Get recent payment transactions (admin endpoint)"""
    try:
        transactions_cursor = db.payment_transactions.find().sort("created_at", -1).limit(limit)
        transactions = []
        async for transaction in transactions_cursor:
            # Remove MongoDB ObjectId field and convert to dict
            if '_id' in transaction:
                del transaction['_id']
            transactions.append(transaction)
        return {"transactions": transactions}
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch transactions: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

# Add a simple root route for testing
@app.get("/")
async def root():
    return {"message": "QNOVA VR API is running!", "status": "healthy"}

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "QNOVA VR API"}

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    # Railway needs explicit port configuration
    port = int(os.environ.get("PORT", 3000))
    print(f"🚀 QNOVA Backend starting on port {port}")
    print(f"📡 Railway will map this to public URL")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)