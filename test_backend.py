#!/usr/bin/env python3
"""
Simple test script to verify backend is working
"""
import requests
import json

def test_backend():
    base_url = "https://vr-website-1-juq1.onrender.com"
    
    print("🔍 Testing QNOVA VR Backend...")
    print(f"Base URL: {base_url}")
    print("-" * 50)
    
    # Test endpoints
    endpoints = [
        "/",
        "/docs",
        "/api/",
        "/api/games",
        "/api/status"
    ]
    
    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=10)
            print(f"✅ {endpoint}: {response.status_code}")
            if response.status_code == 200:
                content = response.text[:100] + "..." if len(response.text) > 100 else response.text
                print(f"   Response: {content}")
        except Exception as e:
            print(f"❌ {endpoint}: Error - {e}")
        print()

if __name__ == "__main__":
    test_backend()