from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    messages = await db.contact_messages.find().to_list(1000)
    return [ContactMessage(**message) for message in messages]

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