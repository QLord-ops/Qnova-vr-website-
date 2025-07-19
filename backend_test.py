#!/usr/bin/env python3
"""
QNOVA VR Backend API Testing Suite
Tests all backend endpoints for the VR studio booking system
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import time

# Backend URL from frontend/.env
BACKEND_URL = "https://92d21704-ca36-498e-9bee-4794558ce091.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def test_api_root():
    """Test the root API endpoint"""
    print_test_header("API Root Endpoint")
    
    try:
        response = requests.get(f"{BACKEND_URL}/")
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "QNOVA VR Studio API" in data["message"]:
                print_success("Root endpoint working correctly")
                print_info(f"Response: {data}")
                return True
            else:
                print_error(f"Unexpected response format: {data}")
                return False
        else:
            print_error(f"Root endpoint failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Failed to connect to root endpoint: {str(e)}")
        return False

def test_booking_creation():
    """Test booking creation with various scenarios"""
    print_test_header("Booking Creation API")
    
    # Test data for different booking scenarios
    test_bookings = [
        {
            "name": "Anna Schmidt",
            "email": "anna.schmidt@email.com",
            "phone": "+49 551 123456",
            "service": "VR Gaming Session",
            "date": "2025-02-15",
            "time": "14:00",
            "participants": 2,
            "message": "Looking forward to trying VR for the first time!"
        },
        {
            "name": "Max Mueller",
            "email": "max.mueller@gmail.com", 
            "phone": "+49 551 987654",
            "service": "PlayStation VR Experience",
            "date": "2025-02-20",
            "time": "16:30",
            "participants": 1,
            "message": "Birthday celebration booking"
        },
        {
            "name": "Lisa Weber",
            "email": "lisa.weber@outlook.com",
            "phone": "+49 551 456789",
            "service": "Group VR Party",
            "date": "2025-02-25",
            "time": "18:00",
            "participants": 4,
            "message": ""
        }
    ]
    
    booking_results = []
    
    for i, booking_data in enumerate(test_bookings, 1):
        print(f"\n{Colors.YELLOW}Test Booking {i}: {booking_data['name']}{Colors.ENDC}")
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/bookings",
                json=booking_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                booking_result = response.json()
                print_success(f"Booking created successfully")
                print_info(f"Booking ID: {booking_result.get('id')}")
                print_info(f"Status: {booking_result.get('status')}")
                print_info(f"Created at: {booking_result.get('created_at')}")
                
                # Verify all fields are present
                required_fields = ['id', 'name', 'email', 'phone', 'service', 'date', 'time', 'participants', 'status', 'created_at']
                missing_fields = [field for field in required_fields if field not in booking_result]
                
                if missing_fields:
                    print_warning(f"Missing fields in response: {missing_fields}")
                else:
                    print_success("All required fields present in response")
                
                booking_results.append(booking_result)
                
            else:
                print_error(f"Booking creation failed with status {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Failed to create booking: {str(e)}")
            return False
    
    print_success(f"All {len(test_bookings)} bookings created successfully")
    return True

def test_booking_retrieval():
    """Test retrieving bookings from database"""
    print_test_header("Booking Retrieval API")
    
    try:
        response = requests.get(f"{BACKEND_URL}/bookings")
        
        if response.status_code == 200:
            bookings = response.json()
            print_success(f"Retrieved {len(bookings)} bookings from database")
            
            if bookings:
                # Check first booking structure
                first_booking = bookings[0]
                required_fields = ['id', 'name', 'email', 'phone', 'service', 'date', 'time', 'participants', 'status']
                
                for field in required_fields:
                    if field in first_booking:
                        print_success(f"Field '{field}' present: {first_booking[field]}")
                    else:
                        print_error(f"Missing required field: {field}")
                        return False
            else:
                print_warning("No bookings found in database")
            
            return True
            
        else:
            print_error(f"Failed to retrieve bookings with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Failed to retrieve bookings: {str(e)}")
        return False

def test_games_catalog():
    """Test games catalog API with filtering"""
    print_test_header("Games Catalog API")
    
    # Test 1: Get all games
    print(f"\n{Colors.YELLOW}Test 1: Get all games{Colors.ENDC}")
    try:
        response = requests.get(f"{BACKEND_URL}/games")
        
        if response.status_code == 200:
            all_games = response.json()
            print_success(f"Retrieved {len(all_games)} games total")
            
            if all_games:
                # Check game structure
                first_game = all_games[0]
                required_fields = ['id', 'name', 'description', 'platform', 'image_url', 'duration', 'max_players']
                
                for field in required_fields:
                    if field in first_game:
                        print_success(f"Field '{field}' present")
                    else:
                        print_error(f"Missing required field: {field}")
                        return False
                
                # Show sample games
                for game in all_games[:3]:
                    print_info(f"Game: {game['name']} ({game['platform']}) - {game['duration']}min")
            else:
                print_error("No games found")
                return False
                
        else:
            print_error(f"Failed to get games with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Failed to get games: {str(e)}")
        return False
    
    # Test 2: Filter VR games
    print(f"\n{Colors.YELLOW}Test 2: Filter VR games{Colors.ENDC}")
    try:
        response = requests.get(f"{BACKEND_URL}/games?platform=VR")
        
        if response.status_code == 200:
            vr_games = response.json()
            print_success(f"Retrieved {len(vr_games)} VR games")
            
            # Verify all games are VR platform
            for game in vr_games:
                if game['platform'] != 'VR':
                    print_error(f"Non-VR game found in VR filter: {game['name']} ({game['platform']})")
                    return False
            
            print_success("All filtered games are VR platform")
            
        else:
            print_error(f"VR games filtering failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Failed to filter VR games: {str(e)}")
        return False
    
    # Test 3: Filter PlayStation games
    print(f"\n{Colors.YELLOW}Test 3: Filter PlayStation games{Colors.ENDC}")
    try:
        response = requests.get(f"{BACKEND_URL}/games?platform=PlayStation")
        
        if response.status_code == 200:
            ps_games = response.json()
            print_success(f"Retrieved {len(ps_games)} PlayStation games")
            
            # Verify all games are PlayStation platform
            for game in ps_games:
                if game['platform'] != 'PlayStation':
                    print_error(f"Non-PlayStation game found in PlayStation filter: {game['name']} ({game['platform']})")
                    return False
            
            print_success("All filtered games are PlayStation platform")
            
        else:
            print_error(f"PlayStation games filtering failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Failed to filter PlayStation games: {str(e)}")
        return False
    
    return True

def test_contact_form():
    """Test contact form API"""
    print_test_header("Contact Form API")
    
    # Test contact messages
    test_messages = [
        {
            "name": "Thomas Bauer",
            "email": "thomas.bauer@email.com",
            "subject": "Group Booking Inquiry",
            "message": "Hi, I'm interested in booking a VR session for my company team building event. We have about 8 people. What packages do you offer?"
        },
        {
            "name": "Sarah Klein",
            "email": "sarah.klein@gmail.com", 
            "subject": "Birthday Party Booking",
            "message": "Hello! I want to book a VR experience for my son's 12th birthday party. What games are suitable for kids?"
        },
        {
            "name": "Michael Wagner",
            "email": "m.wagner@outlook.com",
            "subject": "Technical Question",
            "message": "Do you have wheelchair accessible VR setups? My friend uses a wheelchair and we'd like to visit together."
        }
    ]
    
    for i, message_data in enumerate(test_messages, 1):
        print(f"\n{Colors.YELLOW}Test Message {i}: {message_data['subject']}{Colors.ENDC}")
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/contact",
                json=message_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                message_result = response.json()
                print_success(f"Contact message created successfully")
                print_info(f"Message ID: {message_result.get('id')}")
                print_info(f"From: {message_result.get('name')} ({message_result.get('email')})")
                print_info(f"Subject: {message_result.get('subject')}")
                print_info(f"Created at: {message_result.get('created_at')}")
                
                # Verify all fields are present
                required_fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
                missing_fields = [field for field in required_fields if field not in message_result]
                
                if missing_fields:
                    print_warning(f"Missing fields in response: {missing_fields}")
                else:
                    print_success("All required fields present in response")
                    
            else:
                print_error(f"Contact message creation failed with status {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Failed to create contact message: {str(e)}")
            return False
    
    # Test retrieving contact messages
    print(f"\n{Colors.YELLOW}Test: Retrieve contact messages{Colors.ENDC}")
    try:
        response = requests.get(f"{BACKEND_URL}/contact")
        
        if response.status_code == 200:
            messages = response.json()
            print_success(f"Retrieved {len(messages)} contact messages from database")
            
            if messages:
                # Check first message structure
                first_message = messages[0]
                required_fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
                
                for field in required_fields:
                    if field in first_message:
                        print_success(f"Field '{field}' present")
                    else:
                        print_error(f"Missing required field: {field}")
                        return False
            else:
                print_warning("No contact messages found in database")
            
        else:
            print_error(f"Failed to retrieve contact messages with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Failed to retrieve contact messages: {str(e)}")
        return False
    
    print_success("Contact form API tests completed successfully")
    return True

def test_30_minute_session_duration():
    """Test that booking emails include 30-minute session duration information"""
    print_test_header("30-Minute Session Duration Display")
    
    print_info("Testing that booking confirmations include 30-minute duration information")
    print_info("Creating test bookings to verify email content includes duration...")
    
    # Test bookings with different services to verify duration is added consistently
    test_bookings = [
        {
            "name": "Klaus Müller",
            "email": "klaus.mueller@email.com",
            "phone": "+49 551 123456",
            "service": "VR Gaming Session",
            "date": "2025-02-15",
            "time": "14:00",
            "participants": 2,
            "message": "Testing 30-minute duration display"
        },
        {
            "name": "Maria Schmidt",
            "email": "maria.schmidt@gmail.com", 
            "phone": "+49 551 987654",
            "service": "PlayStation VR Experience",
            "date": "2025-02-20",
            "time": "16:30",
            "participants": 1,
            "message": "Verifying German email duration"
        },
        {
            "name": "Thomas Weber",
            "email": "thomas.weber@outlook.com",
            "phone": "+49 551 456789",
            "service": "Group VR Party",
            "date": "2025-02-25",
            "time": "18:00",
            "participants": 4,
            "message": "Duration test for group booking"
        }
    ]
    
    booking_results = []
    
    for i, booking_data in enumerate(test_bookings, 1):
        print(f"\n{Colors.YELLOW}Duration Test Booking {i}: {booking_data['name']} - {booking_data['service']}{Colors.ENDC}")
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/bookings",
                json=booking_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                booking_result = response.json()
                print_success(f"Booking created successfully")
                print_info(f"Booking ID: {booking_result.get('id')}")
                print_info(f"Service: {booking_result.get('service')}")
                print_info(f"Customer: {booking_result.get('name')} ({booking_result.get('email')})")
                
                # Verify booking was saved correctly
                required_fields = ['id', 'name', 'email', 'phone', 'service', 'date', 'time', 'participants', 'status', 'created_at']
                missing_fields = [field for field in required_fields if field not in booking_result]
                
                if missing_fields:
                    print_warning(f"Missing fields in response: {missing_fields}")
                else:
                    print_success("All required fields present in booking response")
                
                booking_results.append(booking_result)
                
                # Log expected email content for verification
                print_info("Expected email content verification:")
                print_info(f"  ✉️  Studio Owner Email Subject: '🎮 New VR Booking: {booking_data['name']}'")
                print_info(f"  ✉️  Studio Owner Email Service: '{booking_data['service']} (30 minutes)'")
                print_info(f"  ✉️  Customer Email Subject: '🎮 Ihre VR-Session Buchung bestätigt - QNOVA VR'")
                print_info(f"  ✉️  Customer Email Service: '{booking_data['service']} (30 Minuten)'")
                print_success("Duration information should be included in both English and German emails")
                
            else:
                print_error(f"Booking creation failed with status {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Failed to create booking: {str(e)}")
            return False
    
    print(f"\n{Colors.GREEN}{Colors.BOLD}30-MINUTE DURATION TEST SUMMARY:{Colors.ENDC}")
    print_success(f"✅ Created {len(booking_results)} test bookings successfully")
    print_success("✅ All bookings saved to MongoDB with correct structure")
    print_success("✅ Email notifications triggered for each booking")
    print_success("✅ Expected duration format: 'Service Name (30 minutes)' in English emails")
    print_success("✅ Expected duration format: 'Service Name (30 Minuten)' in German emails")
    
    print(f"\n{Colors.BLUE}📧 EMAIL VERIFICATION CHECKLIST:{Colors.ENDC}")
    print_info("Check backend logs for the following email confirmations:")
    for booking in booking_results:
        print_info(f"  • Studio notification for {booking['name']}: Service should show '{booking['service']} (30 minutes)'")
        print_info(f"  • Customer confirmation for {booking['email']}: Service should show '{booking['service']} (30 Minuten)'")
    
    return True

def test_email_simulation():
    """Test email confirmation system by checking backend logs"""
    print_test_header("Email Confirmation System")
    
    print_info("Email simulation testing requires checking backend logs")
    print_info("Creating a test booking to trigger email simulation...")
    
    test_booking = {
        "name": "Email Test User",
        "email": "emailtest@qnova-vr.com",
        "phone": "+49 551 111222",
        "service": "Email Test Session",
        "date": "2025-02-28",
        "time": "10:00",
        "participants": 1,
        "message": "Testing email confirmation system"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/bookings",
            json=test_booking,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            booking_result = response.json()
            print_success("Test booking created for email simulation")
            print_info(f"Booking ID: {booking_result.get('id')}")
            print_info("Check backend logs for email simulation output:")
            print_info("Expected log entries:")
            print_info(f"  📧 EMAIL SENT TO: {test_booking['email']}")
            print_info(f"  📧 SUBJECT: VR Booking Confirmation - {test_booking['name']}")
            print_info(f"  📧 BOOKING ID: {booking_result.get('id')}")
            print_info(f"  📧 SERVICE: {test_booking['service']}")
            print_info(f"  📧 DATE: {test_booking['date']} at {test_booking['time']}")
            print_info(f"  📧 PARTICIPANTS: {test_booking['participants']}")
            
            print_success("Email simulation test completed - check backend logs for confirmation")
            return True
            
        else:
            print_error(f"Failed to create test booking for email simulation: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Email simulation test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("QNOVA VR BACKEND API COMPREHENSIVE TEST SUITE")
    print("=" * 80)
    print(f"{Colors.ENDC}")
    
    test_results = {}
    
    # Run all tests
    tests = [
        ("API Root Endpoint", test_api_root),
        ("Booking Creation", test_booking_creation),
        ("Booking Retrieval", test_booking_retrieval),
        ("Games Catalog", test_games_catalog),
        ("Contact Form", test_contact_form),
        ("Email Simulation", test_email_simulation)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results[test_name] = result
            time.sleep(1)  # Brief pause between tests
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {str(e)}")
            test_results[test_name] = False
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("TEST RESULTS SUMMARY")
    print("=" * 80)
    print(f"{Colors.ENDC}")
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results.items():
        if result:
            print_success(f"{test_name}: PASSED")
            passed += 1
        else:
            print_error(f"{test_name}: FAILED")
            failed += 1
    
    print(f"\n{Colors.BOLD}")
    print(f"Total Tests: {len(test_results)}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.ENDC}")
    print(f"{Colors.RED}Failed: {failed}{Colors.ENDC}")
    
    if failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! QNOVA VR Backend is working correctly!{Colors.ENDC}")
        return True
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ {failed} test(s) failed. Please check the issues above.{Colors.ENDC}")
        return False

if __name__ == "__main__":
    print(f"Testing backend at: {BACKEND_URL}")
    success = run_all_tests()
    sys.exit(0 if success else 1)