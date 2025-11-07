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
BACKEND_URL = "https://qurandaily.preview.emergentagent.com/api"

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

def test_search_endpoint(query: str, description: str) -> bool:
    """Test search endpoint"""
    print_test_header(f"Search Endpoint - {description}")
    
    try:
        response = requests.get(f"{BACKEND_URL}/search", params={"q": query}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Query: {query}")
            print_info(f"Results count: {data.get('count', 0)}")
            
            if data.get('count', 0) > 0:
                print_success(f"Search returned {data['count']} results")
                
                # Show first result
                first_result = data['results'][0]
                print_info(f"First result: {first_result.get('surah_name_turkish')} {first_result.get('ayah_number_in_surah')}")
                print_info(f"Turkish: {first_result.get('text_turkish', '')[:60]}...")
                return True
            else:
                print_error("Search returned 0 results")
                return False
        else:
            print_error(f"Search endpoint failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Search endpoint exception: {e}")
        return False

def test_surahs_list() -> bool:
    """Test surahs list endpoint"""
    print_test_header("Surahs List - 114 Surahs Expected")
    
    try:
        response = requests.get(f"{BACKEND_URL}/surahs", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            total = data.get('total', 0)
            surahs = data.get('surahs', [])
            
            print_info(f"Total surahs: {total}")
            
            if total == 114:
                print_success(f"✅ Correct surah count: {total}")
            else:
                print_error(f"❌ Incorrect surah count: {total} (expected 114)")
                return False
            
            if len(surahs) == 114:
                print_success(f"✅ Surahs array length: {len(surahs)}")
            else:
                print_error(f"❌ Surahs array length: {len(surahs)} (expected 114)")
                return False
            
            # Check first and last surah
            first_surah = surahs[0]
            last_surah = surahs[-1]
            
            print_info(f"First surah: {first_surah.get('name_turkish')} ({first_surah.get('name_arabic')}) - {first_surah.get('verse_count')} verses")
            print_info(f"Last surah: {last_surah.get('name_turkish')} ({last_surah.get('name_arabic')}) - {last_surah.get('verse_count')} verses")
            
            return True
        else:
            print_error(f"Surahs list endpoint failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Surahs list endpoint exception: {e}")
        return False

def test_surah_by_number(surah_number: int, expected_verses: int, description: str) -> bool:
    """Test getting specific surah"""
    print_test_header(f"Surah {surah_number} - {description}")
    
    try:
        response = requests.get(f"{BACKEND_URL}/surah/{surah_number}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            verses = data.get('verses', [])
            
            print_info(f"Surah: {data.get('surah_name')}")
            print_info(f"Verse count: {count}")
            
            if count == expected_verses:
                print_success(f"✅ Correct verse count: {count}")
            else:
                print_error(f"❌ Incorrect verse count: {count} (expected {expected_verses})")
                return False
            
            if len(verses) == expected_verses:
                print_success(f"✅ Verses array length: {len(verses)}")
            else:
                print_error(f"❌ Verses array length: {len(verses)} (expected {expected_verses})")
                return False
            
            # Validate all verses have required fields
            for i, verse in enumerate(verses, 1):
                if not verse.get('text_arabic'):
                    print_error(f"Verse {i}: Arabic text missing")
                    return False
                if not verse.get('text_turkish'):
                    print_error(f"Verse {i}: Turkish text missing")
                    return False
            
            print_success(f"All {count} verses have Arabic and Turkish text")
            return True
        else:
            print_error(f"Surah {surah_number} endpoint failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Surah {surah_number} endpoint exception: {e}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}FINAL COMPREHENSIVE BACKEND TESTING - Production Ready Check{Colors.RESET}")
    print(f"{Colors.BOLD}Backend URL: {BACKEND_URL}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}\n")
    
    results = {}
    
    # Test 1: Health Check
    results["1. Health Check (GET /api/health)"] = test_health_check()
    
    # Test 2: Stats Endpoint
    results["2. Stats (GET /api/stats - 6236 verses)"] = test_stats_endpoint()
    
    # Test 3: Daily Verse
    results["3. Daily Verse (GET /api/verse/daily)"] = test_daily_verse()
    
    # Test 4: Search Endpoints
    results["4. Search - rahman (GET /api/search?q=rahman)"] = test_search_endpoint("rahman", "Search for 'rahman'")
    results["5. Search - fatiha (GET /api/search?q=fatiha)"] = test_search_endpoint("fatiha", "Search for 'fatiha'")
    
    # Test 5: Surahs List
    results["6. Surahs List (GET /api/surahs - 114 surahs)"] = test_surahs_list()
    
    # Test 6: Specific Surah
    results["7. Surah 1 - Fatiha (GET /api/surah/1 - 7 verses)"] = test_surah_by_number(1, 7, "Fatiha - 7 verses expected")
    
    # Test 7: Specific Verse
    results["8. Verse 1 (GET /api/verse/1 - First verse)"] = test_specific_verse(1, "First verse - Besmele")
    
    # Test 8: Error Handling
    results["9. Error Handling - Invalid verse ID"] = test_edge_case(9999, should_fail=True)
    
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
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Backend is production-ready!{Colors.RESET}")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  {total - passed} test(s) failed. Please review the errors above.{Colors.RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
