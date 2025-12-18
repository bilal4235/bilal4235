import requests
import sys
import json
from datetime import datetime

class IlmihalAPITester:
    def __init__(self, base_url="https://islam-catechism.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None
        self.test_favorite_id = None
        self.test_reminder_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else f"{self.api_url}/"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_get_categories(self):
        """Test getting categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        if success and isinstance(response, list) and len(response) == 7:
            print(f"   Found {len(response)} categories as expected")
            # Check if all required categories exist including new 'iman' category
            category_ids = [cat.get('id') for cat in response]
            expected_categories = ['namaz', 'oruc', 'zekat', 'hac', 'gunluk', 'dua', 'iman']
            if all(cat_id in category_ids for cat_id in expected_categories):
                print("   All expected categories found including 'iman'")
            else:
                print(f"   Missing categories: {set(expected_categories) - set(category_ids)}")
        else:
            print(f"   Expected 7 categories, found {len(response) if isinstance(response, list) else 0}")
        return success

    def test_ask_question(self):
        """Test asking a question to AI"""
        test_question = "Namaz kaç rekattır?"
        success, response = self.run_test(
            "Ask Question to AI",
            "POST",
            "ask",
            200,
            data={"question": test_question}
        )
        if success:
            if 'answer' in response and 'session_id' in response:
                self.session_id = response['session_id']
                print(f"   Answer received: {response['answer'][:100]}...")
                print(f"   Session ID: {self.session_id}")
            else:
                print("   Missing required fields in response")
                return False
        return success

    def test_get_history(self):
        """Test getting question history"""
        success, response = self.run_test(
            "Get Question History",
            "GET",
            f"history?session_id={self.session_id}" if self.session_id else "history",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} questions in history")
        return success

    def test_add_favorite(self):
        """Test adding a favorite"""
        favorite_data = {
            "question": "Test soru",
            "answer": "Test cevap",
            "category": "genel"
        }
        success, response = self.run_test(
            "Add Favorite",
            "POST",
            "favorites",
            200,
            data=favorite_data
        )
        if success and 'id' in response:
            self.test_favorite_id = response['id']
            print(f"   Favorite added with ID: {self.test_favorite_id}")
        return success

    def test_get_favorites(self):
        """Test getting favorites"""
        success, response = self.run_test(
            "Get Favorites",
            "GET",
            "favorites",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} favorites")
        return success

    def test_delete_favorite(self):
        """Test deleting a favorite"""
        if not self.test_favorite_id:
            print("❌ No favorite ID available for deletion test")
            return False
            
        success, response = self.run_test(
            "Delete Favorite",
            "DELETE",
            f"favorites/{self.test_favorite_id}",
            200
        )
        return success

    def test_create_reminder(self):
        """Test creating a reminder"""
        reminder_data = {
            "title": "Test Hatırlatma",
            "time": "07:00",
            "enabled": True
        }
        success, response = self.run_test(
            "Create Reminder",
            "POST",
            "reminders",
            200,
            data=reminder_data
        )
        if success and 'id' in response:
            self.test_reminder_id = response['id']
            print(f"   Reminder created with ID: {self.test_reminder_id}")
        return success

    def test_get_reminders(self):
        """Test getting reminders"""
        success, response = self.run_test(
            "Get Reminders",
            "GET",
            "reminders",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} reminders")
        return success

    def test_update_reminder(self):
        """Test updating a reminder"""
        if not self.test_reminder_id:
            print("❌ No reminder ID available for update test")
            return False
            
        update_data = {
            "title": "Updated Test Hatırlatma",
            "time": "08:00",
            "enabled": False
        }
        success, response = self.run_test(
            "Update Reminder",
            "PUT",
            f"reminders/{self.test_reminder_id}",
            200,
            data=update_data
        )
        return success

    def test_delete_reminder(self):
        """Test deleting a reminder"""
        if not self.test_reminder_id:
            print("❌ No reminder ID available for deletion test")
            return False
            
        success, response = self.run_test(
            "Delete Reminder",
            "DELETE",
            f"reminders/{self.test_reminder_id}",
            200
        )
        return success

    def test_text_to_speech(self):
        """Test text-to-speech functionality"""
        tts_data = {
            "text": "Bu bir test metnidir."
        }
        success, response = self.run_test(
            "Text-to-Speech",
            "POST",
            "text-to-speech",
            200,
            data=tts_data
        )
        if success and 'audio_base64' in response:
            print(f"   Audio base64 length: {len(response['audio_base64'])}")
        return success

    def test_diyanet_questions_total(self):
        """Test total Diyanet questions count (should be 219)"""
        success, response = self.run_test(
            "Diyanet Questions Total Count",
            "GET",
            "diyanet-questions",
            200
        )
        if success:
            total = response.get('total', 0)
            if total == 219:
                print(f"   ✅ Correct total: {total} questions")
            else:
                print(f"   ❌ Expected 219 questions, found {total}")
                success = False
        return success

    def test_diyanet_questions_namaz_category(self):
        """Test Diyanet questions in namaz category"""
        success, response = self.run_test(
            "Diyanet Questions - Namaz Category",
            "GET",
            "diyanet-questions?category=namaz",
            200
        )
        if success:
            total = response.get('total', 0)
            questions = response.get('questions', [])
            print(f"   Found {total} questions in 'namaz' category")
            if total > 0:
                print(f"   Sample question: {questions[0].get('question', 'N/A')[:50]}...")
        return success

    def test_diyanet_questions_iman_category(self):
        """Test Diyanet questions in iman category"""
        success, response = self.run_test(
            "Diyanet Questions - İman Category",
            "GET",
            "diyanet-questions?category=iman",
            200
        )
        if success:
            total = response.get('total', 0)
            questions = response.get('questions', [])
            print(f"   Found {total} questions in 'iman' category")
            if total > 0:
                print(f"   Sample question: {questions[0].get('question', 'N/A')[:50]}...")
        return success

    def test_autocomplete_namaz(self):
        """Test autocomplete with 'namaz' query"""
        success, response = self.run_test(
            "Autocomplete - Namaz Query",
            "GET",
            "autocomplete?query=namaz",
            200
        )
        if success:
            suggestions = response.get('suggestions', [])
            print(f"   Found {len(suggestions)} suggestions for 'namaz'")
            if suggestions:
                print(f"   First suggestion: {suggestions[0].get('question', 'N/A')[:50]}...")
        return success

    def test_autocomplete_iman(self):
        """Test autocomplete with 'iman' query"""
        success, response = self.run_test(
            "Autocomplete - İman Query",
            "GET",
            "autocomplete?query=iman",
            200
        )
        if success:
            suggestions = response.get('suggestions', [])
            print(f"   Found {len(suggestions)} suggestions for 'iman'")
            if suggestions:
                print(f"   First suggestion: {suggestions[0].get('question', 'N/A')[:50]}...")
        return success

    def test_autocomplete_oruc(self):
        """Test autocomplete with 'oruç' query"""
        success, response = self.run_test(
            "Autocomplete - Oruç Query",
            "GET",
            "autocomplete?query=oruç",
            200
        )
        if success:
            suggestions = response.get('suggestions', [])
            print(f"   Found {len(suggestions)} suggestions for 'oruç'")
            if suggestions:
                print(f"   First suggestion: {suggestions[0].get('question', 'N/A')[:50]}...")
        return success

    def test_autocomplete_nafile(self):
        """Test autocomplete with 'nafile' query"""
        success, response = self.run_test(
            "Autocomplete - Nafile Query",
            "GET",
            "autocomplete?query=nafile",
            200
        )
        if success:
            suggestions = response.get('suggestions', [])
            print(f"   Found {len(suggestions)} suggestions for 'nafile'")
            if suggestions:
                print(f"   First suggestion: {suggestions[0].get('question', 'N/A')[:50]}...")
        return success

    def test_ask_namaz_farzlari(self):
        """Test asking about namaz obligations"""
        test_question = "Namazın farzları nelerdir?"
        success, response = self.run_test(
            "Ask Question - Namazın Farzları",
            "POST",
            "ask",
            200,
            data={"question": test_question}
        )
        if success:
            answer = response.get('answer', '')
            if answer:
                print(f"   Answer received (length: {len(answer)} chars)")
                print(f"   Answer preview: {answer[:100]}...")
                # Check if it's from Diyanet source
                if "📚 Kaynak:" in answer:
                    print("   ✅ Answer from Diyanet source")
                elif "🤖 AI Asistan" in answer:
                    print("   ℹ️ Answer from AI assistant")
            else:
                print("   ❌ No answer received")
                success = False
        return success

    def test_ask_iman_sartlari(self):
        """Test asking about faith conditions"""
        test_question = "İmanın şartları nelerdir?"
        success, response = self.run_test(
            "Ask Question - İmanın Şartları",
            "POST",
            "ask",
            200,
            data={"question": test_question}
        )
        if success:
            answer = response.get('answer', '')
            if answer:
                print(f"   Answer received (length: {len(answer)} chars)")
                print(f"   Answer preview: {answer[:100]}...")
                # Check if it's from Diyanet source
                if "📚 Kaynak:" in answer:
                    print("   ✅ Answer from Diyanet source")
                elif "🤖 AI Asistan" in answer:
                    print("   ℹ️ Answer from AI assistant")
            else:
                print("   ❌ No answer received")
                success = False
        return success

    def test_ask_oruc_farz(self):
        """Test asking about fasting obligations"""
        test_question = "Oruç tutmak kimlere farzdır?"
        success, response = self.run_test(
            "Ask Question - Oruç Farzı",
            "POST",
            "ask",
            200,
            data={"question": test_question}
        )
        if success:
            answer = response.get('answer', '')
            if answer:
                print(f"   Answer received (length: {len(answer)} chars)")
                print(f"   Answer preview: {answer[:100]}...")
                # Check if it's from Diyanet source
                if "📚 Kaynak:" in answer:
                    print("   ✅ Answer from Diyanet source")
                elif "🤖 AI Asistan" in answer:
                    print("   ℹ️ Answer from AI assistant")
            else:
                print("   ❌ No answer received")
                success = False
        return success

def main():
    print("🚀 Starting İlmihal Asistanı API Tests")
    print("=" * 50)
    
    tester = IlmihalAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_get_categories,
        tester.test_ask_question,
        tester.test_get_history,
        tester.test_add_favorite,
        tester.test_get_favorites,
        tester.test_delete_favorite,
        tester.test_create_reminder,
        tester.test_get_reminders,
        tester.test_update_reminder,
        tester.test_delete_reminder,
        tester.test_text_to_speech,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())