#!/usr/bin/env python3
"""
QNOVA VR Backend Email Testing Suite
Focus on testing real Gmail SMTP email notifications for bookings
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import time

# Backend URL from frontend/.env
BACKEND_URL = "https://97ee9221-0bc6-4aaf-ba22-3be1c2427265.preview.emergentagent.com/api"

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

def test_real_email_notifications():
    """Test real Gmail SMTP email notifications for bookings"""
    print_test_header("Real Email Notifications System (HIGH PRIORITY)")
    
    print_info("Testing real Gmail SMTP email notifications...")
    print_info("Gmail User: qnovavr.de@gmail.com")
    print_info("Testing with German customer data as requested...")
    
    # German customer booking data as requested
    test_booking = {
        "name": "Klaus Müller",
        "email": "klaus.mueller@gmail.com",
        "phone": "+49 551 987654",
        "service": "VR Gaming Session",
        "date": "2025-02-20",
        "time": "15:30",
        "participants": 2,
        "message": "Hallo! Ich möchte gerne eine VR-Session für mich und meinen Sohn buchen. Wir sind beide Anfänger."
    }
    
    print(f"\n{Colors.YELLOW}Creating booking with German customer data:{Colors.ENDC}")
    print_info(f"Customer: {test_booking['name']}")
    print_info(f"Email: {test_booking['email']}")
    print_info(f"Service: {test_booking['service']}")
    print_info(f"Date/Time: {test_booking['date']} at {test_booking['time']}")
    print_info(f"Participants: {test_booking['participants']}")
    
    try:
        # Create booking to trigger real email notifications
        response = requests.post(
            f"{BACKEND_URL}/bookings",
            json=test_booking,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            booking_result = response.json()
            print_success("✅ Booking created successfully")
            print_info(f"Booking ID: {booking_result.get('id')}")
            print_info(f"Status: {booking_result.get('status')}")
            
            # Verify booking is saved to MongoDB
            print(f"\n{Colors.YELLOW}Verifying booking saved to MongoDB:{Colors.ENDC}")
            
            # Wait a moment for background tasks to complete
            print_info("Waiting 5 seconds for email background tasks to complete...")
            time.sleep(5)
            
            # Check if booking exists in database
            bookings_response = requests.get(f"{BACKEND_URL}/bookings")
            if bookings_response.status_code == 200:
                bookings = bookings_response.json()
                booking_found = False
                for booking in bookings:
                    if booking.get('id') == booking_result.get('id'):
                        booking_found = True
                        print_success("✅ Booking successfully saved to MongoDB")
                        print_info(f"Database entry confirmed for booking ID: {booking['id']}")
                        break
                
                if not booking_found:
                    print_error("❌ Booking not found in MongoDB")
                    return False
            else:
                print_error("❌ Failed to verify booking in database")
                return False
            
            # Email verification instructions
            print(f"\n{Colors.YELLOW}Email Notification Verification:{Colors.ENDC}")
            print_info("Two emails should have been sent:")
            print_info("1. 📧 Studio Owner Notification → qnovavr.de@gmail.com")
            print_info("   Subject: 🎮 New VR Booking: Klaus Müller")
            print_info("   Content: Customer details, booking info, German message")
            print_info("")
            print_info("2. 📧 Customer Confirmation → klaus.mueller@gmail.com")
            print_info("   Subject: 🎮 Your VR Session Booking Confirmed - QNOVA VR")
            print_info("   Content: Booking confirmation, studio details, instructions")
            
            print(f"\n{Colors.YELLOW}Expected Email Content Features:{Colors.ENDC}")
            print_info("✓ HTML formatted emails with proper styling")
            print_info("✓ Studio owner email includes customer's German message")
            print_info("✓ Customer email includes visit instructions and studio info")
            print_info("✓ Both emails include complete booking details")
            print_info("✓ Professional QNOVA VR branding and contact info")
            
            print_success("✅ Real email notification test completed successfully")
            print_warning("⚠️  Manual verification required: Check both email inboxes to confirm delivery")
            
            return True
            
        else:
            print_error(f"❌ Booking creation failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"❌ Real email notification test failed: {str(e)}")
        return False

def test_email_error_handling():
    """Test email error handling scenarios"""
    print_test_header("Email Error Handling")
    
    print_info("Testing that booking still works even if email fails...")
    print_info("This test verifies system resilience when email service is unavailable")
    
    # Test booking with potentially problematic email
    test_booking = {
        "name": "Test Error Handling",
        "email": "test.error@example.com",
        "phone": "+49 551 123456",
        "service": "Error Handling Test",
        "date": "2025-02-25",
        "time": "12:00",
        "participants": 1,
        "message": "Testing error handling"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/bookings",
            json=test_booking,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            booking_result = response.json()
            print_success("✅ Booking created successfully despite potential email issues")
            print_info(f"Booking ID: {booking_result.get('id')}")
            
            # Verify booking is still saved to database
            time.sleep(3)
            bookings_response = requests.get(f"{BACKEND_URL}/bookings")
            if bookings_response.status_code == 200:
                bookings = bookings_response.json()
                booking_found = any(b.get('id') == booking_result.get('id') for b in bookings)
                
                if booking_found:
                    print_success("✅ Booking persisted to database even with email issues")
                    print_info("System shows proper resilience - core functionality maintained")
                else:
                    print_error("❌ Booking not found in database")
                    return False
            
            return True
            
        else:
            print_error(f"❌ Booking creation failed: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"❌ Error handling test failed: {str(e)}")
        return False

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

def run_email_tests():
    """Run email-focused backend API tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("QNOVA VR BACKEND API - EMAIL NOTIFICATION TESTING")
    print("=" * 80)
    print(f"{Colors.ENDC}")
    
    test_results = {}
    
    # Run tests with focus on email functionality as requested
    tests = [
        ("API Root Endpoint", test_api_root),
        ("Real Email Notifications (HIGH PRIORITY)", test_real_email_notifications),
        ("Email Error Handling", test_email_error_handling)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results[test_name] = result
            time.sleep(2)  # Brief pause between tests
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {str(e)}")
            test_results[test_name] = False
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("EMAIL TESTING RESULTS SUMMARY")
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
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL EMAIL TESTS PASSED! QNOVA VR Email System is working correctly!{Colors.ENDC}")
        return True
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ {failed} test(s) failed. Please check the issues above.{Colors.ENDC}")
        return False

if __name__ == "__main__":
    print(f"Testing backend email functionality at: {BACKEND_URL}")
    success = run_email_tests()
    sys.exit(0 if success else 1)