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

    # ==================== QUIZ API TESTS ====================
    
    def test_quiz_categories(self):
        """Test GET /api/quiz/categories - Quiz kategorileri ve soru sayıları"""
        success, response = self.run_test(
            "Quiz Categories API",
            "GET",
            "quiz/categories",
            200
        )
        if success:
            categories = response.get('categories', [])
            print(f"   Found {len(categories)} quiz categories")
            if categories:
                for cat in categories:
                    print(f"   - {cat.get('name', 'N/A')}: {cat.get('question_count', 0)} soru")
                # Check if namaz and iman categories exist
                category_ids = [cat.get('id') for cat in categories]
                if 'namaz' in category_ids and 'iman' in category_ids:
                    print("   ✅ Namaz ve İman kategorileri mevcut")
                else:
                    print("   ❌ Namaz veya İman kategorisi eksik")
                    success = False
        return success

    def test_quiz_random_questions(self):
        """Test GET /api/quiz?count=5 - Karışık 5 soru"""
        success, response = self.run_test(
            "Quiz Random 5 Questions",
            "GET",
            "quiz?count=5",
            200
        )
        if success:
            questions = response.get('questions', [])
            total = response.get('total', 0)
            print(f"   Received {len(questions)} questions (total: {total})")
            
            if len(questions) == 5:
                print("   ✅ Correct number of questions")
                # Check question structure
                first_q = questions[0] if questions else {}
                required_fields = ['id', 'question', 'options', 'correct_answer', 'category', 'explanation', 'source']
                missing_fields = [field for field in required_fields if field not in first_q]
                
                if not missing_fields:
                    print("   ✅ All required fields present")
                    # Check options count
                    options = first_q.get('options', [])
                    if len(options) == 4:
                        print("   ✅ 4 seçenek mevcut")
                    else:
                        print(f"   ❌ Expected 4 options, found {len(options)}")
                        success = False
                    
                    # Check correct_answer is valid index
                    correct_answer = first_q.get('correct_answer', -1)
                    if 0 <= correct_answer <= 3:
                        print(f"   ✅ Doğru cevap indexi geçerli: {correct_answer}")
                    else:
                        print(f"   ❌ Invalid correct_answer index: {correct_answer}")
                        success = False
                        
                    # Check explanation and source exist
                    if first_q.get('explanation') and first_q.get('source'):
                        print("   ✅ Açıklama ve kaynak mevcut")
                    else:
                        print("   ❌ Açıklama veya kaynak eksik")
                        success = False
                else:
                    print(f"   ❌ Missing fields: {missing_fields}")
                    success = False
            else:
                print(f"   ❌ Expected 5 questions, got {len(questions)}")
                success = False
        return success

    def test_quiz_namaz_category(self):
        """Test GET /api/quiz?category=namaz&count=3 - Namaz kategorisinden 3 soru"""
        success, response = self.run_test(
            "Quiz Namaz Category 3 Questions",
            "GET",
            "quiz?category=namaz&count=3",
            200
        )
        if success:
            questions = response.get('questions', [])
            category = response.get('category')
            print(f"   Received {len(questions)} questions from category: {category}")
            
            if len(questions) == 3:
                print("   ✅ Correct number of questions")
                # Check all questions are from namaz category
                all_namaz = all(q.get('category') == 'namaz' for q in questions)
                if all_namaz:
                    print("   ✅ Tüm sorular namaz kategorisinden")
                else:
                    print("   ❌ Bazı sorular farklı kategorilerden")
                    success = False
            else:
                print(f"   ❌ Expected 3 questions, got {len(questions)}")
                success = False
        return success

    def test_quiz_iman_category(self):
        """Test GET /api/quiz?category=iman&count=3 - İman kategorisinden 3 soru"""
        success, response = self.run_test(
            "Quiz İman Category 3 Questions",
            "GET",
            "quiz?category=iman&count=3",
            200
        )
        if success:
            questions = response.get('questions', [])
            category = response.get('category')
            print(f"   Received {len(questions)} questions from category: {category}")
            
            if len(questions) >= 1:  # İman kategorisinde az soru olabilir
                print(f"   ✅ İman kategorisinden {len(questions)} soru alındı")
                # Check all questions are from iman category
                all_iman = all(q.get('category') == 'iman' for q in questions)
                if all_iman:
                    print("   ✅ Tüm sorular iman kategorisinden")
                else:
                    print("   ❌ Bazı sorular farklı kategorilerden")
                    success = False
            else:
                print(f"   ❌ No questions received from iman category")
                success = False
        return success

    def test_quiz_submit(self):
        """Test POST /api/quiz/submit - Quiz sonuçlarını gönder ve puan hesapla"""
        # First get a quiz to have valid question data
        quiz_success, quiz_response = self.run_test(
            "Get Quiz for Submit Test",
            "GET",
            "quiz?category=namaz&count=2",
            200
        )
        
        if not quiz_success:
            print("   ❌ Could not get quiz for submit test")
            return False
            
        questions = quiz_response.get('questions', [])
        if len(questions) < 2:
            print("   ❌ Not enough questions for submit test")
            return False
            
        # Prepare answers (mix of correct and incorrect)
        answers = []
        for i, q in enumerate(questions):
            answers.append({
                "question_id": q['id'],
                "selected": q['correct_answer'] if i == 0 else (q['correct_answer'] + 1) % 4,  # First correct, second wrong
                "correct_answer": q['correct_answer']
            })
        
        submit_data = {
            "answers": answers,
            "category": "namaz"
        }
        
        success, response = self.run_test(
            "Quiz Submit Results",
            "POST",
            "quiz/submit",
            200,
            data=submit_data
        )
        
        if success:
            score = response.get('score')
            total = response.get('total')
            percentage = response.get('percentage')
            
            print(f"   Score: {score}/{total} ({percentage}%)")
            
            # Check required fields
            if score is not None and total is not None and percentage is not None:
                print("   ✅ Score, total, percentage dönüyor")
                # Verify calculation
                expected_percentage = (score / total * 100) if total > 0 else 0
                if abs(percentage - expected_percentage) < 0.1:
                    print("   ✅ Percentage calculation correct")
                else:
                    print(f"   ❌ Percentage calculation wrong: expected {expected_percentage}, got {percentage}")
                    success = False
            else:
                print("   ❌ Missing score, total, or percentage in response")
                success = False
        return success

    def test_quiz_history(self):
        """Test GET /api/quiz/history - Quiz geçmişi"""
        success, response = self.run_test(
            "Quiz History",
            "GET",
            "quiz/history",
            200
        )
        if success:
            results = response.get('results', [])
            print(f"   Found {len(results)} quiz results in history")
            if results:
                latest = results[0]
                print(f"   Latest result: {latest.get('score', 0)}/{latest.get('total', 0)} ({latest.get('percentage', 0)}%)")
                print("   ✅ Quiz geçmişi başarıyla alındı")
            else:
                print("   ℹ️ No quiz history found (expected after submit test)")
        return success

    # ==================== İSLAMİ TAKVİM API TESTS ====================
    
    def test_islamic_calendar_main(self):
        """Test GET /api/calendar - Tüm takvim verilerini getir"""
        success, response = self.run_test(
            "Islamic Calendar Main API",
            "GET",
            "calendar",
            200
        )
        if success:
            year = response.get('year')
            hijri_year = response.get('hijri_year')
            source = response.get('source')
            important_dates = response.get('important_dates', [])
            total_events = response.get('total_events', 0)
            
            print(f"   Year: {year}")
            print(f"   Hijri Year: {hijri_year}")
            print(f"   Source: {source}")
            print(f"   Total Events: {total_events}")
            
            # Verify required fields
            if year and hijri_year and source and isinstance(important_dates, list):
                print("   ✅ All required fields present")
                if source == "Diyanet İşleri Başkanlığı":
                    print("   ✅ Correct source: Diyanet İşleri Başkanlığı")
                else:
                    print(f"   ❌ Unexpected source: {source}")
                    success = False
                    
                if total_events == len(important_dates):
                    print("   ✅ Total events count matches important_dates length")
                else:
                    print(f"   ❌ Total events mismatch: {total_events} vs {len(important_dates)}")
                    success = False
            else:
                print("   ❌ Missing required fields")
                success = False
        return success

    def test_upcoming_events(self):
        """Test GET /api/calendar/upcoming?limit=5 - Yaklaşan etkinlikleri getir"""
        success, response = self.run_test(
            "Upcoming Events API",
            "GET",
            "calendar/upcoming?limit=5",
            200
        )
        if success:
            upcoming_events = response.get('upcoming_events', [])
            total = response.get('total', 0)
            
            print(f"   Found {len(upcoming_events)} upcoming events (total: {total})")
            
            if upcoming_events:
                first_event = upcoming_events[0]
                required_fields = ['days_until', 'is_today', 'is_tomorrow', 'is_this_week']
                missing_fields = [field for field in required_fields if field not in first_event]
                
                if not missing_fields:
                    print("   ✅ All required fields present (days_until, is_today, is_tomorrow, is_this_week)")
                    print(f"   First event: {first_event.get('name')} - {first_event.get('days_until')} days until")
                else:
                    print(f"   ❌ Missing fields: {missing_fields}")
                    success = False
            else:
                print("   ℹ️ No upcoming events found")
        return success

    def test_event_details_mirac(self):
        """Test GET /api/calendar/event/mirac - Miraç Kandili detayları"""
        success, response = self.run_test(
            "Event Details - Miraç Kandili",
            "GET",
            "calendar/event/mirac",
            200
        )
        if success:
            required_fields = ['name', 'date', 'hijri_date', 'description', 'practices']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print("   ✅ All required fields present (name, date, hijri_date, description, practices)")
                print(f"   Event: {response.get('name')}")
                print(f"   Date: {response.get('date')} ({response.get('hijri_date')})")
                print(f"   Practices count: {len(response.get('practices', []))}")
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
                success = False
        return success

    def test_event_details_ramazan_bayrami(self):
        """Test GET /api/calendar/event/ramazan_bayrami - Ramazan Bayramı detayları"""
        success, response = self.run_test(
            "Event Details - Ramazan Bayramı",
            "GET",
            "calendar/event/ramazan_bayrami",
            200
        )
        if success:
            required_fields = ['name', 'date', 'hijri_date', 'description', 'practices']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print("   ✅ All required fields present (name, date, hijri_date, description, practices)")
                print(f"   Event: {response.get('name')}")
                print(f"   Date: {response.get('date')} ({response.get('hijri_date')})")
                print(f"   Practices count: {len(response.get('practices', []))}")
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
                success = False
        return success

    def test_category_kandil(self):
        """Test GET /api/calendar/category/kandil - Kandil günleri"""
        success, response = self.run_test(
            "Calendar Category - Kandil",
            "GET",
            "calendar/category/kandil",
            200
        )
        if success:
            category = response.get('category')
            events = response.get('events', [])
            total = response.get('total', 0)
            
            print(f"   Category: {category}")
            print(f"   Found {len(events)} kandil events (total: {total})")
            
            if category == "kandil" and isinstance(events, list):
                print("   ✅ Correct category and events structure")
                if events:
                    kandil_names = [event.get('name') for event in events]
                    print(f"   Kandil events: {', '.join(kandil_names)}")
            else:
                print("   ❌ Incorrect category or events structure")
                success = False
        return success

    def test_category_bayram(self):
        """Test GET /api/calendar/category/bayram - Bayramlar"""
        success, response = self.run_test(
            "Calendar Category - Bayram",
            "GET",
            "calendar/category/bayram",
            200
        )
        if success:
            category = response.get('category')
            events = response.get('events', [])
            total = response.get('total', 0)
            
            print(f"   Category: {category}")
            print(f"   Found {len(events)} bayram events (total: {total})")
            
            if category == "bayram" and isinstance(events, list):
                print("   ✅ Correct category and events structure")
                if events:
                    bayram_names = [event.get('name') for event in events]
                    print(f"   Bayram events: {', '.join(bayram_names)}")
            else:
                print("   ❌ Incorrect category or events structure")
                success = False
        return success

    def test_category_ozel_gun(self):
        """Test GET /api/calendar/category/ozel_gun - Özel günler"""
        success, response = self.run_test(
            "Calendar Category - Özel Günler",
            "GET",
            "calendar/category/ozel_gun",
            200
        )
        if success:
            category = response.get('category')
            events = response.get('events', [])
            total = response.get('total', 0)
            
            print(f"   Category: {category}")
            print(f"   Found {len(events)} özel gün events (total: {total})")
            
            if category == "ozel_gun" and isinstance(events, list):
                print("   ✅ Correct category and events structure")
                if events:
                    ozel_gun_names = [event.get('name') for event in events]
                    print(f"   Özel gün events: {', '.join(ozel_gun_names)}")
            else:
                print("   ❌ Incorrect category or events structure")
                success = False
        return success

    def test_hijri_months(self):
        """Test GET /api/calendar/months - Hicri aylar hakkında bilgi"""
        success, response = self.run_test(
            "Hijri Months API",
            "GET",
            "calendar/months",
            200
        )
        if success:
            months = response.get('months', {})
            source = response.get('source')
            
            print(f"   Source: {source}")
            print(f"   Found {len(months)} hijri months")
            
            if isinstance(months, dict) and len(months) == 12:
                print("   ✅ All 12 hijri months present")
                expected_months = ['Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 
                                 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 
                                 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce']
                missing_months = [month for month in expected_months if month not in months]
                
                if not missing_months:
                    print("   ✅ All expected hijri months found")
                else:
                    print(f"   ❌ Missing months: {missing_months}")
                    success = False
            else:
                print(f"   ❌ Expected 12 months, found {len(months) if isinstance(months, dict) else 0}")
                success = False
        return success

def main():
    print("🚀 Starting İlmihal Asistanı API Tests")
    print("=" * 50)
    
    tester = IlmihalAPITester()
    
    # Run all tests - prioritizing İslami Takvim (Islamic Calendar) tests as requested
    tests = [
        tester.test_root_endpoint,
        # İSLAMİ TAKVİM API TESTS (PRIORITY - User Request)
        tester.test_islamic_calendar_main,
        tester.test_upcoming_events,
        tester.test_event_details_mirac,
        tester.test_event_details_ramazan_bayrami,
        tester.test_category_kandil,
        tester.test_category_bayram,
        tester.test_category_ozel_gun,
        tester.test_hijri_months,
        # İlmihal Database Tests
        tester.test_diyanet_questions_total,
        tester.test_diyanet_questions_namaz_category,
        tester.test_diyanet_questions_iman_category,
        # Quiz API Tests
        tester.test_quiz_categories,
        tester.test_quiz_random_questions,
        tester.test_quiz_namaz_category,
        tester.test_quiz_iman_category,
        tester.test_quiz_submit,
        tester.test_quiz_history,
        # Autocomplete Tests
        tester.test_autocomplete_namaz,
        tester.test_autocomplete_iman,
        tester.test_autocomplete_oruc,
        tester.test_autocomplete_nafile,
        # Question-Answer Tests
        tester.test_ask_namaz_farzlari,
        tester.test_ask_iman_sartlari,
        tester.test_ask_oruc_farz,
        # Category Tests
        tester.test_get_categories,
        # Other functionality tests
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