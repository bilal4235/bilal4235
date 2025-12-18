from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64
import difflib

ROOT_DIR = Path(__file__).parent

# İlmihal veritabanını JSON dosyasından yükle
def load_ilmihal_database():
    """Kapsamlı İlmihal veritabanını JSON dosyasından yükle"""
    json_path = ROOT_DIR / 'ilmihal_complete.json'
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('ilmihal_database', [])
    except Exception as e:
        logging.error(f"İlmihal JSON yüklenemedi: {e}")
        return []

# Tüm İlmihal sorularını yükle
ALL_DIYANET_QA = load_ilmihal_database()
logging.info(f"İlmihal veritabanı yüklendi: {len(ALL_DIYANET_QA)} soru")

load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Get API key
api_key = os.environ.get('EMERGENT_LLM_KEY')

# Initialize Diyanet database
async def init_diyanet_database():
    """Diyanet İşleri Başkanlığı soru-cevaplarını veritabanına yükle"""
    existing = await db.diyanet_qa.count_documents({})
    if existing == 0:
        for qa in ALL_DIYANET_QA:
            qa['id'] = str(uuid.uuid4())
            qa['timestamp'] = datetime.now(timezone.utc).isoformat()
        await db.diyanet_qa.insert_many(ALL_DIYANET_QA)
        logging.info(f"Diyanet veritabanı yüklendi: {len(ALL_DIYANET_QA)} soru-cevap")

def find_similar_question(user_question: str, threshold: float = 0.6):
    """Kullanıcı sorusuna benzer Diyanet sorusu bul"""
    user_q_lower = user_question.lower().strip()
    
    best_match = None
    best_ratio = 0
    
    for qa in ALL_DIYANET_QA:
        diyanet_q_lower = qa['question'].lower().strip()
        
        # Tam eşleşme kontrolü
        if user_q_lower == diyanet_q_lower:
            return qa, 1.0
        
        # Benzerlik oranı hesapla
        ratio = difflib.SequenceMatcher(None, user_q_lower, diyanet_q_lower).ratio()
        
        # Anahtar kelime kontrolü
        user_words = set(user_q_lower.split())
        diyanet_words = set(diyanet_q_lower.split())
        common_words = user_words & diyanet_words
        
        if len(common_words) >= 2:  # En az 2 ortak kelime
            ratio += 0.2
        
        if ratio > best_ratio:
            best_ratio = ratio
            best_match = qa
    
    if best_ratio >= threshold:
        return best_match, best_ratio
    
    return None, 0

# Define Models
class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AskRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class AskResponse(BaseModel):
    answer: str
    session_id: str
    timestamp: datetime

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    name_en: str
    description: str
    icon: str

class Favorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FavoriteCreate(BaseModel):
    question: str
    answer: str
    category: str

class Reminder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    time: str
    enabled: bool = True
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReminderCreate(BaseModel):
    title: str
    time: str
    enabled: bool = True

class TextToSpeechRequest(BaseModel):
    text: str

class TextToSpeechResponse(BaseModel):
    audio_base64: str

# Quiz Models
class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: int  # 0-3 arası index
    category: str
    explanation: str
    source: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    total: int
    category: Optional[str] = None

class QuizResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    score: int
    total: int
    percentage: float
    category: Optional[str] = None
    answers: List[dict]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuizSubmit(BaseModel):
    answers: List[dict]  # [{"question_id": "...", "selected": 0}]
    category: Optional[str] = None

# Initialize categories
async def init_categories():
    categories = [
        {"id": "namaz", "name": "Namaz", "name_en": "Prayer", "description": "Farz, vacip ve sünnetler hakkında", "icon": "🕌"},
        {"id": "oruc", "name": "Oruç", "name_en": "Fasting", "description": "Ramazan ve diğer oruçlar", "icon": "🌙"},
        {"id": "zekat", "name": "Zekât", "name_en": "Zakat", "description": "Mal, fitre ve sadaka", "icon": "💰"},
        {"id": "hac", "name": "Hac & Umre", "name_en": "Hajj & Umrah", "description": "Hac ve umre ibadetleri", "icon": "🕋"},
        {"id": "gunluk", "name": "Günlük Hayat", "name_en": "Daily Life", "description": "Adab ve günlük yaşam", "icon": "📖"},
        {"id": "dua", "name": "Dua ve Zikir", "name_en": "Prayers & Dhikr", "description": "Dualar ve zikir çeşitleri", "icon": "🤲"},
        {"id": "iman", "name": "İman Esasları", "name_en": "Faith Essentials", "description": "İmanın şartları ve akaid", "icon": "✨"}
    ]
    
    existing = await db.categories.count_documents({})
    if existing == 0:
        await db.categories.insert_many(categories)

@app.on_event("startup")
async def startup_event():
    await init_categories()
    await init_diyanet_database()

# Routes
@api_router.get("/")
async def root():
    return {"message": "İlmihal Asistanı API"}

@api_router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # ÖNCE DİYANET VERİTABANINDA ARA
        similar_qa, similarity = find_similar_question(request.question)
        
        if similar_qa and similarity >= 0.6:
            # Diyanet kaynağından cevap bul
            answer = similar_qa['answer']
            source_note = f"\n\n📚 Kaynak: {similar_qa['source']}"
            final_answer = answer + source_note
            
            logging.info(f"Diyanet kaynağından cevap bulundu (benzerlik: {similarity:.2f})")
            
            # Save to history
            question_doc = {
                "id": str(uuid.uuid4()),
                "question": request.question,
                "answer": final_answer,
                "category": similar_qa['category'],
                "session_id": session_id,
                "source": "diyanet",
                "similarity": similarity,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db.questions.insert_one(question_doc)
            
            return AskResponse(
                answer=final_answer,
                session_id=session_id,
                timestamp=datetime.now(timezone.utc)
            )
        
        # Eğer Diyanet'te yoksa AI'ya sor
        logging.info("Diyanet'te bulunamadı, AI'ya soruluyor...")
        
        # System message for Islamic context
        system_message = """Sen bir İslami ilmihal asistanısın. Kullanıcılara İslamiyet ile ilgili sorularını 
        Kur'an, Hadis ve güvenilir fıkıh kaynaklarına (özellikle Diyanet İşleri Başkanlığı yayınları) dayanarak 
        cevaplıyorsun. Cevapların kısa, anlaşılır ve kesin olmalı. Gerektiğinde ayet veya hadis referansı ekle. 
        Her zaman nazik ve saygılı bir dil kullan. Cevaplarını Türkçe ver."""
        
        # Create chat instance
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Send message
        user_message = UserMessage(text=request.question)
        response = await chat.send_message(user_message)
        
        ai_note = "\n\n🤖 AI Asistan tarafından oluşturulmuştur. Daha detaylı bilgi için güvenilir kaynaklara başvurabilirsiniz."
        final_answer = response + ai_note
        
        # Save to history
        question_doc = {
            "id": str(uuid.uuid4()),
            "question": request.question,
            "answer": final_answer,
            "category": "genel",
            "session_id": session_id,
            "source": "ai",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.questions.insert_one(question_doc)
        
        return AskResponse(
            answer=final_answer,
            session_id=session_id,
            timestamp=datetime.now(timezone.utc)
        )
    except Exception as e:
        logging.error(f"Error in ask_question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.get("/diyanet-questions")
async def get_diyanet_questions(category: Optional[str] = None):
    """Diyanet İşleri Başkanlığı kaynaklı soru-cevapları getir"""
    if category:
        questions = [qa for qa in ALL_DIYANET_QA if qa['category'] == category]
    else:
        questions = ALL_DIYANET_QA
    return {"total": len(questions), "questions": questions}

@api_router.get("/autocomplete")
async def autocomplete_questions(query: str, limit: int = 10):
    """Kullanıcı yazarken Diyanet sorularından öneri getir"""
    if not query or len(query) < 1:  # 1 harften itibaren ara
        return {"suggestions": []}
    
    query_lower = query.lower().strip()
    suggestions = []
    
    for qa in ALL_DIYANET_QA:
        question_lower = qa['question'].lower()
        answer_lower = qa['answer'][:200].lower()  # Cevabın ilk 200 karakterinde de ara
        
        # Başlangıç eşleşmesi veya kelime içi eşleşme (soruda veya cevapta)
        if (question_lower.startswith(query_lower) or 
            query_lower in question_lower or 
            query_lower in answer_lower):
            suggestions.append({
                "question": qa['question'],
                "category": qa['category'],
                "preview": qa['answer'][:100] + "..."
            })
    
    # En alakalı olanları önce getir (başlangıç eşleşmeleri)
    suggestions.sort(key=lambda x: (
        not x['question'].lower().startswith(query_lower),  # Başlangıç eşleşmeleri önce
        len(x['question'])  # Kısa sorular önce
    ))
    
    return {"suggestions": suggestions[:limit]}

@api_router.get("/history", response_model=List[Question])
async def get_history(session_id: Optional[str] = None, limit: int = 50):
    query = {"session_id": session_id} if session_id else {}
    questions = await db.questions.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    
    for q in questions:
        if isinstance(q['timestamp'], str):
            q['timestamp'] = datetime.fromisoformat(q['timestamp'])
    
    return questions

@api_router.post("/favorites", response_model=Favorite)
async def add_favorite(favorite: FavoriteCreate):
    fav_obj = Favorite(**favorite.model_dump())
    doc = fav_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.favorites.insert_one(doc)
    return fav_obj

@api_router.get("/favorites", response_model=List[Favorite])
async def get_favorites():
    favorites = await db.favorites.find({}, {"_id": 0}).to_list(1000)
    for f in favorites:
        if isinstance(f['timestamp'], str):
            f['timestamp'] = datetime.fromisoformat(f['timestamp'])
    return favorites

@api_router.delete("/favorites/{favorite_id}")
async def delete_favorite(favorite_id: str):
    result = await db.favorites.delete_one({"id": favorite_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Favorite deleted"}

@api_router.post("/reminders", response_model=Reminder)
async def create_reminder(reminder: ReminderCreate):
    reminder_obj = Reminder(**reminder.model_dump())
    doc = reminder_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.reminders.insert_one(doc)
    return reminder_obj

@api_router.get("/reminders", response_model=List[Reminder])
async def get_reminders():
    reminders = await db.reminders.find({}, {"_id": 0}).to_list(1000)
    for r in reminders:
        if isinstance(r['timestamp'], str):
            r['timestamp'] = datetime.fromisoformat(r['timestamp'])
    return reminders

@api_router.put("/reminders/{reminder_id}")
async def update_reminder(reminder_id: str, reminder: ReminderCreate):
    result = await db.reminders.update_one(
        {"id": reminder_id},
        {"$set": reminder.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder updated"}

@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str):
    result = await db.reminders.delete_one({"id": reminder_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted"}

@api_router.post("/text-to-speech", response_model=TextToSpeechResponse)
async def text_to_speech(request: TextToSpeechRequest):
    try:
        import openai
        
        # Use openai library directly with Emergent key
        openai.api_key = api_key
        
        response = openai.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=request.text[:4096]  # Limit text length
        )
        
        # Convert to base64
        audio_bytes = response.content
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return TextToSpeechResponse(audio_base64=audio_base64)
    except Exception as e:
        logging.error(f"Error in text_to_speech: {str(e)}")
        # Return mock success for now since TTS requires specific OpenAI key
        # Using browser-based speech synthesis as fallback
        raise HTTPException(status_code=503, detail="Text-to-Speech şu anda kullanılamıyor. Lütfen tarayıcınızın sesli okuma özelliğini kullanın.")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()