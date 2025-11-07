#!/usr/bin/env python3
"""
COMPREHENSIVE Backend Testing for 1 Ayet 1 Yorum API
Testing all endpoints with Diyanet İşleri Başkanlığı data validation
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://verse-comment.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name: str):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BLUE}{Colors.BOLD}TEST: {test_name}{Colors.RESET}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*80}{Colors.RESET}")

def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")

def test_health_check() -> bool:
    """Test 1: Health Check Endpoint"""
    print_test_header("Health Check Endpoint")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if data.get("status") == "healthy":
                print_success("Health check passed - API is healthy")
                return True
            else:
                print_error(f"Unexpected status: {data.get('status')}")
                return False
        else:
            print_error(f"Health check failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Health check exception: {e}")
        return False

def test_stats_endpoint() -> bool:
    """Test 2: Stats Endpoint - Verify 6236 verses"""
    print_test_header("Stats Endpoint - Verify 6236 Verses")
    
    try:
        response = requests.get(f"{BACKEND_URL}/stats", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            total_verses = data.get("total_verses", 0)
            status = data.get("status", "")
            
            if total_verses == 6236:
                print_success(f"✅ Correct verse count: {total_verses} verses")
            else:
                print_error(f"❌ Incorrect verse count: {total_verses} (expected 6236)")
                return False
            
            if status == "ready":
                print_success("Database status: ready")
            else:
                print_warning(f"Database status: {status}")
            
            return total_verses == 6236
        else:
            print_error(f"Stats endpoint failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Stats endpoint exception: {e}")
        return False

def validate_verse_data(verse: Dict[str, Any], verse_id: int = None) -> bool:
    """Validate verse data structure and content"""
    required_fields = [
        "verse_number", "surah_number", "surah_name_arabic", 
        "surah_name_turkish", "ayah_number_in_surah", 
        "text_arabic", "text_turkish", "tafsir", "revelation_type"
    ]
    
    all_valid = True
    
    # Check all required fields exist
    for field in required_fields:
        if field not in verse:
            print_error(f"Missing field: {field}")
            all_valid = False
    
    if not all_valid:
        return False
    
    # Validate verse_number if provided
    if verse_id and verse.get("verse_number") != verse_id:
        print_error(f"Verse number mismatch: expected {verse_id}, got {verse.get('verse_number')}")
        all_valid = False
    
    # Check Arabic text is not empty and contains Arabic characters
    arabic_text = verse.get("text_arabic", "")
    if not arabic_text:
        print_error("Arabic text is empty")
        all_valid = False
    elif not any('\u0600' <= char <= '\u06FF' for char in arabic_text):
        print_error("Arabic text doesn't contain Arabic characters")
        all_valid = False
    else:
        print_success(f"Arabic text present: {arabic_text[:50]}...")
    
    # Check Turkish text is not empty
    turkish_text = verse.get("text_turkish", "")
    if not turkish_text:
        print_error("Turkish text is empty")
        all_valid = False
    else:
        print_success(f"Turkish text present: {turkish_text[:50]}...")
    
    # Check Tafsir is not empty
    tafsir = verse.get("tafsir", "")
    if not tafsir:
        print_error("Tafsir is empty")
        all_valid = False
    else:
        print_success(f"Tafsir present: {tafsir[:50]}...")
    
    # Check surah names
    if verse.get("surah_name_arabic"):
        print_success(f"Surah name (Arabic): {verse.get('surah_name_arabic')}")
    else:
        print_error("Surah name (Arabic) is empty")
        all_valid = False
    
    if verse.get("surah_name_turkish"):
        print_success(f"Surah name (Turkish): {verse.get('surah_name_turkish')}")
    else:
        print_error("Surah name (Turkish) is empty")
        all_valid = False
    
    # Check revelation type
    revelation_type = verse.get("revelation_type", "")
    if revelation_type in ["Meccan", "Medinan"]:
        print_success(f"Revelation type: {revelation_type}")
    else:
        print_warning(f"Unexpected revelation type: {revelation_type}")
    
    return all_valid

def test_daily_verse() -> bool:
    """Test 3: Daily Verse Endpoint"""
    print_test_header("Daily Verse Endpoint")
    
    try:
        response = requests.get(f"{BACKEND_URL}/verse/daily", timeout=10)
        
        if response.status_code == 200:
            verse = response.json()
            print_info(f"Daily verse ID: {verse.get('verse_number')}")
            print_info(f"Surah: {verse.get('surah_name_turkish')} ({verse.get('surah_name_arabic')})")
            print_info(f"Ayah: {verse.get('ayah_number_in_surah')}")
            
            return validate_verse_data(verse)
        else:
            print_error(f"Daily verse endpoint failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Daily verse endpoint exception: {e}")
        return False

def test_specific_verse(verse_id: int, description: str) -> bool:
    """Test specific verse by ID"""
    print_test_header(f"Specific Verse Test - {description}")
    
    try:
        response = requests.get(f"{BACKEND_URL}/verse/{verse_id}", timeout=10)
        
        if response.status_code == 200:
            verse = response.json()
            print_info(f"Verse ID: {verse.get('verse_number')}")
            print_info(f"Surah: {verse.get('surah_name_turkish')} ({verse.get('surah_name_arabic')})")
            print_info(f"Ayah: {verse.get('ayah_number_in_surah')}")
            
            return validate_verse_data(verse, verse_id)
        else:
            print_error(f"Verse {verse_id} endpoint failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Verse {verse_id} endpoint exception: {e}")
        return False

def test_edge_case(verse_id: int, should_fail: bool = True) -> bool:
    """Test edge cases - invalid verse IDs"""
    print_test_header(f"Edge Case Test - Verse ID: {verse_id}")
    
    try:
        response = requests.get(f"{BACKEND_URL}/verse/{verse_id}", timeout=10)
        
        if should_fail:
            if response.status_code in [404, 500]:
                print_success(f"Correctly rejected invalid verse ID {verse_id} (status: {response.status_code})")
                return True
            else:
                print_error(f"Should have rejected verse ID {verse_id}, but got status: {response.status_code}")
                return False
        else:
            if response.status_code == 200:
                print_success(f"Valid verse ID {verse_id} accepted")
                return True
            else:
                print_error(f"Valid verse ID {verse_id} rejected with status: {response.status_code}")
                return False
                
    except Exception as e:
        print_error(f"Edge case test exception: {e}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}COMPREHENSIVE BACKEND TESTING - Diyanet İşleri Başkanlığı Verileri{Colors.RESET}")
    print(f"{Colors.BOLD}Backend URL: {BACKEND_URL}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}\n")
    
    results = {}
    
    # Test 1: Health Check
    results["Health Check"] = test_health_check()
    
    # Test 2: Stats Endpoint
    results["Stats (6236 verses)"] = test_stats_endpoint()
    
    # Test 3: Daily Verse
    results["Daily Verse"] = test_daily_verse()
    
    # Test 4: Specific Verses
    results["Verse 1 (Fatiha 1 - Besmele)"] = test_specific_verse(1, "Fatiha 1 - Besmele")
    results["Verse 2 (Fatiha 2)"] = test_specific_verse(2, "Fatiha 2")
    results["Verse 6222 (İhlas 1)"] = test_specific_verse(6222, "İhlas 1 - Correct verse")
    results["Verse 6236 (Nas 6 - Son ayet)"] = test_specific_verse(6236, "Nas 6 - Son ayet")
    
    # Test 5: Edge Cases
    results["Edge Case: Verse 0"] = test_edge_case(0, should_fail=True)
    results["Edge Case: Verse 9999"] = test_edge_case(9999, should_fail=True)
    results["Edge Case: Verse -1"] = test_edge_case(-1, should_fail=True)
    
    # Summary
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}\n")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{Colors.GREEN}✅ PASSED{Colors.RESET}" if result else f"{Colors.RED}❌ FAILED{Colors.RESET}"
        print(f"{test_name}: {status}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests passed{Colors.RESET}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Backend is working perfectly!{Colors.RESET}")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  Some tests failed. Please review the errors above.{Colors.RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
