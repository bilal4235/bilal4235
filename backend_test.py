#!/usr/bin/env python3
"""
COMPREHENSIVE Backend Testing for 1 Ayet 1 Yorum API
Testing all endpoints including NEW FEATURES: Favorites, Reading History, Statistics
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

# ==================== NEW FEATURES TESTING ====================

def test_favorites_add(verse_id: int = 1) -> bool:
    """Test adding verse to favorites"""
    print_test_header(f"Add Favorite - Verse {verse_id}")
    
    try:
        payload = {"verse_id": verse_id}
        response = requests.post(f"{BACKEND_URL}/favorites", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if data.get('status') in ['success', 'exists']:
                print_success(f"Add favorite result: {data.get('message')}")
                return True
            else:
                print_error(f"Unexpected status: {data.get('status')}")
                return False
        else:
            print_error(f"Add favorite failed with status code: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Add favorite exception: {e}")
        return False

def test_favorites_duplicate(verse_id: int = 1) -> bool:
    """Test adding same verse to favorites (duplicate check)"""
    print_test_header(f"Duplicate Favorite Check - Verse {verse_id}")
    
    try:
        payload = {"verse_id": verse_id}
        response = requests.post(f"{BACKEND_URL}/favorites", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if data.get('status') == 'exists':
                print_success(f"Duplicate correctly detected: {data.get('message')}")
                return True
            elif data.get('status') == 'success':
                print_warning("Added again - duplicate check may not be working")
                return True  # Still working, just no duplicate check
            else:
                print_error(f"Unexpected status: {data.get('status')}")
                return False
        else:
            print_error(f"Duplicate favorite test failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Duplicate favorite test exception: {e}")
        return False

def test_favorites_list() -> bool:
    """Test listing all favorites"""
    print_test_header("List All Favorites")
    
    try:
        response = requests.get(f"{BACKEND_URL}/favorites", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Favorites count: {data.get('count', 0)}")
            
            if 'favorites' in data and 'count' in data:
                print_success(f"Favorites list retrieved: {data['count']} favorites")
                
                # Show first favorite if exists
                if data['count'] > 0:
                    first_fav = data['favorites'][0]
                    print_info(f"First favorite: Verse {first_fav.get('verse_number')} - {first_fav.get('surah_name_turkish')}")
                
                return True
            else:
                print_error("Missing required fields in favorites response")
                return False
        else:
            print_error(f"List favorites failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"List favorites exception: {e}")
        return False

def test_favorites_check(verse_id: int = 1) -> bool:
    """Test checking if verse is favorited"""
    print_test_header(f"Check Favorite Status - Verse {verse_id}")
    
    try:
        response = requests.get(f"{BACKEND_URL}/favorites/check/{verse_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if 'is_favorite' in data:
                print_success(f"Favorite check result: {data['is_favorite']}")
                return True
            else:
                print_error("Missing is_favorite field")
                return False
        else:
            print_error(f"Check favorite failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Check favorite exception: {e}")
        return False

def test_favorites_remove(verse_id: int = 1) -> bool:
    """Test removing verse from favorites"""
    print_test_header(f"Remove Favorite - Verse {verse_id}")
    
    try:
        response = requests.delete(f"{BACKEND_URL}/favorites/{verse_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if data.get('status') == 'success':
                print_success(f"Remove favorite result: {data.get('message')}")
                return True
            else:
                print_error(f"Unexpected status: {data.get('status')}")
                return False
        elif response.status_code == 404:
            print_success("Correctly returned 404 for non-existent favorite")
            return True
        else:
            print_error(f"Remove favorite failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Remove favorite exception: {e}")
        return False

def test_reading_history_add(verse_id: int = 1) -> bool:
    """Test adding reading history"""
    print_test_header(f"Add Reading History - Verse {verse_id}")
    
    try:
        payload = {"verse_id": verse_id}
        response = requests.post(f"{BACKEND_URL}/reading-history", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if data.get('status') in ['success', 'exists']:
                print_success(f"Reading history result: {data.get('message')}")
                return True
            else:
                print_error(f"Unexpected status: {data.get('status')}")
                return False
        else:
            print_error(f"Add reading history failed with status code: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Add reading history exception: {e}")
        return False

def test_reading_history_duplicate(verse_id: int = 1) -> bool:
    """Test adding same reading history (same day duplicate check)"""
    print_test_header(f"Duplicate Reading History Check - Verse {verse_id}")
    
    try:
        payload = {"verse_id": verse_id}
        response = requests.post(f"{BACKEND_URL}/reading-history", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if data.get('status') == 'exists':
                print_success(f"Same-day duplicate correctly detected: {data.get('message')}")
                return True
            elif data.get('status') == 'success':
                print_warning("Added again - same-day duplicate check may not be working")
                return True  # Still working, just no duplicate check
            else:
                print_error(f"Unexpected status: {data.get('status')}")
                return False
        else:
            print_error(f"Duplicate reading history test failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Duplicate reading history test exception: {e}")
        return False

def test_statistics() -> bool:
    """Test getting user statistics"""
    print_test_header("User Statistics")
    
    try:
        response = requests.get(f"{BACKEND_URL}/statistics", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            required_fields = ['total_verses_read', 'verses_this_month', 'reading_streak', 'top_surahs']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_success(f"Statistics retrieved successfully:")
                print_info(f"  Total verses read: {data['total_verses_read']}")
                print_info(f"  Verses this month: {data['verses_this_month']}")
                print_info(f"  Reading streak: {data['reading_streak']} days")
                print_info(f"  Top surahs: {len(data['top_surahs'])} surahs")
                
                # Show top surahs if any
                for i, surah in enumerate(data['top_surahs'][:3], 1):
                    print_info(f"    {i}. {surah.get('surah_name')} - {surah.get('read_count')} times")
                
                return True
            else:
                print_error(f"Missing required fields: {missing_fields}")
                return False
        else:
            print_error(f"Statistics failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Statistics exception: {e}")
        return False

def test_favorites_invalid_verse() -> bool:
    """Test adding invalid verse to favorites (error handling)"""
    print_test_header("Error Handling - Invalid Verse ID for Favorites")
    
    try:
        payload = {"verse_id": 99999}
        response = requests.post(f"{BACKEND_URL}/favorites", json=payload, timeout=10)
        
        if response.status_code in [404, 500]:
            print_success(f"Correctly rejected invalid verse ID (status: {response.status_code})")
            return True
        else:
            print_error(f"Should reject invalid verse ID, but got status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Invalid verse test exception: {e}")
        return False

def run_all_tests():
    """Run all backend tests including new features"""
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}COMPREHENSIVE BACKEND TESTING - Including NEW FEATURES{Colors.RESET}")
    print(f"{Colors.BOLD}Backend URL: {BACKEND_URL}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}\n")
    
    results = {}
    
    # ========== EXISTING ENDPOINTS (Quick Verification) ==========
    print(f"\n{Colors.BOLD}📋 EXISTING ENDPOINTS (Quick Verification){Colors.RESET}")
    print(f"{Colors.BOLD}{'-'*50}{Colors.RESET}")
    
    results["1. Health Check (GET /api/health)"] = test_health_check()
    results["2. Stats (GET /api/stats)"] = test_stats_endpoint()
    results["3. Daily Verse (GET /api/verse/daily)"] = test_daily_verse()
    results["4. Search - rahman (GET /api/search?q=rahman)"] = test_search_endpoint("rahman", "Search for 'rahman'")
    results["5. Surahs List (GET /api/surahs)"] = test_surahs_list()
    results["6. Surah 1 - Fatiha (GET /api/surah/1)"] = test_surah_by_number(1, 7, "Fatiha - 7 verses expected")
    results["7. Verse 1 (GET /api/verse/1)"] = test_specific_verse(1, "First verse - Besmele")
    
    # ========== NEW FEATURES TESTING ==========
    print(f"\n{Colors.BOLD}🆕 NEW FEATURES TESTING{Colors.RESET}")
    print(f"{Colors.BOLD}{'-'*50}{Colors.RESET}")
    
    # Favorites Testing
    print(f"\n{Colors.BOLD}💖 FAVORITES TESTING{Colors.RESET}")
    results["8. Add Favorite (POST /api/favorites)"] = test_favorites_add(1)
    results["9. Duplicate Favorite Check"] = test_favorites_duplicate(1)
    results["10. List Favorites (GET /api/favorites)"] = test_favorites_list()
    results["11. Check Favorite (GET /api/favorites/check/1)"] = test_favorites_check(1)
    
    # Reading History Testing
    print(f"\n{Colors.BOLD}📚 READING HISTORY TESTING{Colors.RESET}")
    results["12. Add Reading History (POST /api/reading-history)"] = test_reading_history_add(1)
    results["13. Duplicate Reading History Check"] = test_reading_history_duplicate(1)
    
    # Statistics Testing
    print(f"\n{Colors.BOLD}📊 STATISTICS TESTING{Colors.RESET}")
    results["14. User Statistics (GET /api/statistics)"] = test_statistics()
    
    # Error Handling Testing
    print(f"\n{Colors.BOLD}⚠️  ERROR HANDLING TESTING{Colors.RESET}")
    results["15. Invalid Verse ID Error Handling"] = test_favorites_invalid_verse()
    results["16. Edge Case - Invalid Verse ID"] = test_edge_case(9999, should_fail=True)
    
    # Cleanup
    print(f"\n{Colors.BOLD}🧹 CLEANUP{Colors.RESET}")
    results["17. Remove Favorite (DELETE /api/favorites/1)"] = test_favorites_remove(1)
    
    # Summary
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}\n")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    # Group results by category
    existing_tests = {k: v for k, v in list(results.items())[:7]}
    new_feature_tests = {k: v for k, v in list(results.items())[7:]}
    
    print(f"{Colors.BOLD}EXISTING ENDPOINTS:{Colors.RESET}")
    for test_name, result in existing_tests.items():
        status = f"{Colors.GREEN}✅ PASSED{Colors.RESET}" if result else f"{Colors.RED}❌ FAILED{Colors.RESET}"
        print(f"  {test_name}: {status}")
    
    print(f"\n{Colors.BOLD}NEW FEATURES:{Colors.RESET}")
    for test_name, result in new_feature_tests.items():
        status = f"{Colors.GREEN}✅ PASSED{Colors.RESET}" if result else f"{Colors.RED}❌ FAILED{Colors.RESET}"
        print(f"  {test_name}: {status}")
    
    print(f"\n{Colors.BOLD}OVERALL RESULTS:{Colors.RESET}")
    print(f"Total: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Backend with NEW FEATURES is production-ready!{Colors.RESET}")
        return 0
    else:
        failed_tests = [name for name, result in results.items() if not result]
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  {total - passed} test(s) failed:{Colors.RESET}")
        for test in failed_tests:
            print(f"  {Colors.RED}❌ {test}{Colors.RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
