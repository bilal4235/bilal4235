#!/usr/bin/env python3
"""
Backend API Testing for 1 Ayet 1 Yorum App
Tests all backend endpoints and verifies data integrity
"""

import requests
import json
from datetime import datetime
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://verse-comment.preview.emergentagent.com"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def test_health_endpoint():
    """Test GET /api/health endpoint"""
    print("\n" + "="*60)
    print("Testing: GET /api/health")
    print("="*60)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2)}")
            
            if "status" in data and data["status"] == "healthy":
                print_success("Health check passed - status is healthy")
                return True
            else:
                print_error("Health check failed - status is not healthy")
                return False
        else:
            print_error(f"Health check failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Health check failed with exception: {str(e)}")
        return False

def test_stats_endpoint():
    """Test GET /api/stats endpoint"""
    print("\n" + "="*60)
    print("Testing: GET /api/stats")
    print("="*60)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/stats", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2)}")
            
            total_verses = data.get("total_verses", 0)
            status = data.get("status", "")
            
            if total_verses == 6236:
                print_success(f"Correct verse count: {total_verses}")
            else:
                print_error(f"Incorrect verse count: {total_verses} (expected 6236)")
                return False
            
            if status == "ready":
                print_success("Status is 'ready'")
                return True
            else:
                print_error(f"Status is '{status}' (expected 'ready')")
                return False
        else:
            print_error(f"Stats endpoint failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Stats endpoint failed with exception: {str(e)}")
        return False

def test_daily_verse_endpoint():
    """Test GET /api/verse/daily endpoint"""
    print("\n" + "="*60)
    print("Testing: GET /api/verse/daily")
    print("="*60)
    
    try:
        # Test first call
        response1 = requests.get(f"{BACKEND_URL}/api/verse/daily", timeout=10)
        
        if response1.status_code != 200:
            print_error(f"Daily verse endpoint failed with status code: {response1.status_code}")
            return False
        
        verse1 = response1.json()
        print_info(f"First call response (truncated):")
        print_info(f"  verse_number: {verse1.get('verse_number')}")
        print_info(f"  surah_number: {verse1.get('surah_number')}")
        print_info(f"  surah_name_arabic: {verse1.get('surah_name_arabic')}")
        print_info(f"  surah_name_turkish: {verse1.get('surah_name_turkish')}")
        print_info(f"  ayah_number_in_surah: {verse1.get('ayah_number_in_surah')}")
        print_info(f"  text_arabic: {verse1.get('text_arabic', '')[:50]}...")
        print_info(f"  text_turkish: {verse1.get('text_turkish', '')[:50]}...")
        print_info(f"  revelation_type: {verse1.get('revelation_type')}")
        
        # Verify all required fields are present
        required_fields = [
            "verse_number", "surah_number", "surah_name_arabic", 
            "surah_name_turkish", "ayah_number_in_surah", "text_arabic",
            "text_turkish", "tafsir", "revelation_type"
        ]
        
        missing_fields = []
        for field in required_fields:
            if field not in verse1:
                missing_fields.append(field)
        
        if missing_fields:
            print_error(f"Missing required fields: {', '.join(missing_fields)}")
            return False
        else:
            print_success("All required fields are present")
        
        # Verify fields are not empty
        empty_fields = []
        for field in required_fields:
            if not verse1.get(field):
                empty_fields.append(field)
        
        if empty_fields:
            print_warning(f"Empty fields found: {', '.join(empty_fields)}")
        
        # Test second call - should return same verse for same day
        response2 = requests.get(f"{BACKEND_URL}/api/verse/daily", timeout=10)
        
        if response2.status_code != 200:
            print_error(f"Second daily verse call failed with status code: {response2.status_code}")
            return False
        
        verse2 = response2.json()
        
        if verse1.get("verse_number") == verse2.get("verse_number"):
            print_success("Daily verse consistency verified - same verse returned for same day")
            return True
        else:
            print_error(f"Daily verse inconsistency - got different verses: {verse1.get('verse_number')} vs {verse2.get('verse_number')}")
            return False
            
    except Exception as e:
        print_error(f"Daily verse endpoint failed with exception: {str(e)}")
        return False

def test_verse_by_id_endpoint():
    """Test GET /api/verse/{verse_id} endpoint"""
    print("\n" + "="*60)
    print("Testing: GET /api/verse/{verse_id}")
    print("="*60)
    
    test_ids = [1, 100, 6236]
    all_passed = True
    
    for verse_id in test_ids:
        try:
            response = requests.get(f"{BACKEND_URL}/api/verse/{verse_id}", timeout=10)
            
            if response.status_code == 200:
                verse = response.json()
                print_success(f"Verse {verse_id} retrieved successfully")
                print_info(f"  Surah: {verse.get('surah_name_turkish')} ({verse.get('surah_number')})")
                print_info(f"  Ayah in Surah: {verse.get('ayah_number_in_surah')}")
                
                # Verify verse_number matches
                if verse.get("verse_number") == verse_id:
                    print_success(f"  Verse number matches: {verse_id}")
                else:
                    print_error(f"  Verse number mismatch: expected {verse_id}, got {verse.get('verse_number')}")
                    all_passed = False
            else:
                print_error(f"Failed to retrieve verse {verse_id} - status code: {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print_error(f"Failed to retrieve verse {verse_id} - exception: {str(e)}")
            all_passed = False
    
    # Test invalid verse ID (should return 404)
    print_info("\nTesting invalid verse ID (should return 404)...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/verse/99999", timeout=10)
        
        if response.status_code == 404:
            print_success("Invalid verse ID correctly returns 404")
        else:
            print_error(f"Invalid verse ID returned status code: {response.status_code} (expected 404)")
            all_passed = False
            
    except Exception as e:
        print_error(f"Invalid verse ID test failed with exception: {str(e)}")
        all_passed = False
    
    return all_passed

def test_arabic_turkish_encoding():
    """Test that Arabic and Turkish text encoding is correct"""
    print("\n" + "="*60)
    print("Testing: Arabic and Turkish Text Encoding")
    print("="*60)
    
    try:
        # Get verse 1 (Al-Fatiha, first verse)
        response = requests.get(f"{BACKEND_URL}/api/verse/1", timeout=10)
        
        if response.status_code != 200:
            print_error("Failed to retrieve verse for encoding test")
            return False
        
        verse = response.json()
        text_arabic = verse.get("text_arabic", "")
        text_turkish = verse.get("text_turkish", "")
        
        # Check if Arabic text contains Arabic characters
        has_arabic = any('\u0600' <= char <= '\u06FF' for char in text_arabic)
        
        if has_arabic:
            print_success("Arabic text encoding is correct (contains Arabic characters)")
            print_info(f"  Arabic text sample: {text_arabic[:100]}")
        else:
            print_error("Arabic text encoding issue - no Arabic characters found")
            return False
        
        # Check if Turkish text is not empty and readable
        if text_turkish and len(text_turkish) > 0:
            print_success("Turkish text is present")
            print_info(f"  Turkish text sample: {text_turkish[:100]}")
        else:
            print_error("Turkish text is empty")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Encoding test failed with exception: {str(e)}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print("\n" + "="*60)
    print("BACKEND API TESTING - 1 Ayet 1 Yorum App")
    print("="*60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        "Health Check": test_health_endpoint(),
        "Stats Endpoint": test_stats_endpoint(),
        "Daily Verse Endpoint": test_daily_verse_endpoint(),
        "Verse by ID Endpoint": test_verse_by_id_endpoint(),
        "Arabic/Turkish Encoding": test_arabic_turkish_encoding()
    }
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    print("\n" + "="*60)
    print(f"Total: {passed}/{total} tests passed")
    print("="*60)
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
