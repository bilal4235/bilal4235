from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import httpx
from typing import List, Dict
import asyncio

load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.quran_app
verses_collection = db.verses

# Diyanet İşleri Başkanlığı Açık Kaynak Kuran API
QURAN_API_BASE = "https://api.acikkuran.com"
DIYANET_AUTHOR_ID = 11  # Diyanet İşleri Başkanlığı

async def initialize_database():
    """Background task to initialize database"""
    try:
        count = await verses_collection.count_documents({})
        if count == 0:
            print("🌙 Veritabanı boş. Diyanet İşleri Başkanlığı verilerini yüklüyorum...")
            await fetch_and_store_quran_data()
        else:
            print(f"✅ Veritabanında {count} ayet mevcut.")
    except Exception as e:
        print(f"❌ Veritabanı başlatma hatası: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize database with Quran verses if empty - non-blocking"""
    # Don't block startup - check async
    asyncio.create_task(initialize_database())

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "1 Ayet 1 Yorum API"}

@app.get("/api/verse/daily")
async def get_daily_verse():
    """Get daily verse based on current date"""
    try:
        # Calculate which verse to show based on days since epoch
        # This creates a repeating cycle through all verses
        epoch = datetime(2024, 1, 1)  # Starting point
        today = datetime.now()
        days_diff = (today - epoch).days
        
        # Get total verse count
        total_verses = await verses_collection.count_documents({})
        if total_verses == 0:
            raise HTTPException(status_code=500, detail="No verses in database")
        
        # Calculate verse index (0-based)
        verse_index = days_diff % total_verses
        
        # Get the verse
        verse = await verses_collection.find_one(
            {},
            skip=verse_index,
            sort=[("verse_number", 1)]
        )
        
        if not verse:
            raise HTTPException(status_code=404, detail="Verse not found")
        
        # Convert ObjectId to string
        verse["_id"] = str(verse["_id"])
        
        return verse
    except Exception as e:
        print(f"Error getting daily verse: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/verse/{verse_id}")
async def get_verse_by_id(verse_id: int):
    """Get specific verse by its sequential ID"""
    try:
        verse = await verses_collection.find_one({"verse_number": verse_id})
        if not verse:
            raise HTTPException(status_code=404, detail="Verse not found")
        
        verse["_id"] = str(verse["_id"])
        return verse
    except Exception as e:
        print(f"Error getting verse: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_stats():
    """Get database statistics"""
    try:
        total_verses = await verses_collection.count_documents({})
        return {
            "total_verses": total_verses,
            "status": "ready" if total_verses > 0 else "initializing"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/surahs")
async def get_all_surahs():
    """Get list of all surahs with verse counts"""
    try:
        # Aggregate to get surah info
        pipeline = [
            {
                "$group": {
                    "_id": "$surah_number",
                    "surah_name_turkish": {"$first": "$surah_name_turkish"},
                    "surah_name_arabic": {"$first": "$surah_name_arabic"},
                    "revelation_type": {"$first": "$revelation_type"},
                    "verse_count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        cursor = verses_collection.aggregate(pipeline)
        surahs = await cursor.to_list(length=114)
        
        # Format response
        result = []
        for surah in surahs:
            result.append({
                "surah_number": surah["_id"],
                "name_turkish": surah["surah_name_turkish"],
                "name_arabic": surah["surah_name_arabic"],
                "verse_count": surah["verse_count"],
                "revelation_type": surah["revelation_type"]
            })
        
        return {"surahs": result, "total": len(result)}
    except Exception as e:
        print(f"Error getting surahs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/surah/{surah_number}")
async def get_surah_verses(surah_number: int):
    """Get all verses from a specific surah"""
    try:
        if surah_number < 1 or surah_number > 114:
            raise HTTPException(status_code=400, detail="Surah number must be between 1 and 114")
        
        cursor = verses_collection.find({"surah_number": surah_number}).sort("ayah_number_in_surah", 1)
        verses = await cursor.to_list(length=300)
        
        if not verses:
            raise HTTPException(status_code=404, detail="Surah not found")
        
        # Convert ObjectId to string
        for verse in verses:
            verse["_id"] = str(verse["_id"])
        
        return {
            "surah_number": surah_number,
            "surah_name": verses[0]["surah_name_turkish"],
            "verses": verses,
            "count": len(verses)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting surah verses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search")
async def search_verses(q: str = "", surah: int = None, limit: int = 20):
    """Search verses by text or surah"""
    try:
        if not q and not surah:
            raise HTTPException(status_code=400, detail="Query parameter 'q' or 'surah' is required")
        
        # Build search query
        search_query = {}
        
        if surah:
            search_query["surah_number"] = surah
        
        if q:
            # Search in Turkish translation, Arabic text, or surah names
            search_query["$or"] = [
                {"text_turkish": {"$regex": q, "$options": "i"}},
                {"text_arabic": {"$regex": q, "$options": "i"}},
                {"surah_name_turkish": {"$regex": q, "$options": "i"}},
                {"surah_name_arabic": {"$regex": q, "$options": "i"}}
            ]
        
        # Find matching verses
        cursor = verses_collection.find(search_query).limit(limit)
        verses = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for verse in verses:
            verse["_id"] = str(verse["_id"])
        
        return {
            "results": verses,
            "count": len(verses),
            "query": q,
            "surah": surah
        }
    except Exception as e:
        print(f"Error searching verses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_and_store_quran_data():
    """Fetch Quran data from Diyanet İşleri Başkanlığı API and store in MongoDB"""
    try:
        print("🌙 Diyanet İşleri Başkanlığı resmi Kuran API'sinden veri çekiliyor...")
        async with httpx.AsyncClient(timeout=60.0) as client:
            verses_to_insert = []
            verse_counter = 1
            
            # First, get list of all surahs
            surahs_response = await client.get(f"{QURAN_API_BASE}/surahs")
            if surahs_response.status_code != 200:
                raise Exception("Sureleri çekerken hata oluştu")
            
            surahs_data = surahs_response.json()
            all_surahs = surahs_data.get("data", [])
            
            # Fetch all 114 surahs
            total_inserted = 0
            for surah in all_surahs:
                surah_id = surah["id"]
                surah_name_tr = surah["name"]
                surah_name_ar = surah["name_original"]
                verse_count = surah["verse_count"]
                
                print(f"🔄 {surah_name_tr} Suresi ({surah_id}/114) - {verse_count} ayet çekiliyor...")
                
                try:
                    surah_verses = []
                    # Fetch all verses for this surah
                    for verse_num in range(1, verse_count + 1):
                        try:
                            # Get verse with Diyanet meal (single API call - faster!)
                            verse_response = await client.get(
                                f"{QURAN_API_BASE}/surah/{surah_id}/verse/{verse_num}",
                                params={"author": DIYANET_AUTHOR_ID},
                                timeout=10.0
                            )
                            
                            if verse_response.status_code == 200:
                                verse_data = verse_response.json().get("data", {})
                                
                                # Extract data
                                turkish_translation = verse_data.get("translation", {}).get("text", "")
                                transcription = verse_data.get("transcription", "")
                                arabic_text = verse_data.get("verse", "")
                                
                                # Add verse ending marker (۝)
                                if arabic_text and not arabic_text.endswith('۝'):
                                    arabic_text = arabic_text + ' ۝'
                                
                                verse_doc = {
                                    "verse_number": verse_counter,
                                    "surah_number": surah_id,
                                    "surah_name_arabic": surah_name_ar,
                                    "surah_name_turkish": surah_name_tr,
                                    "ayah_number_in_surah": verse_num,
                                    "text_arabic": arabic_text,
                                    "text_turkish": turkish_translation,
                                    "transcription": transcription,
                                    "tafsir": get_basic_tafsir(surah_id, verse_num),
                                    "revelation_type": get_revelation_type(surah_id),
                                    "created_at": datetime.utcnow()
                                }
                                surah_verses.append(verse_doc)
                                verse_counter += 1
                            
                            # Minimal delay
                            await asyncio.sleep(0.02)
                        except Exception as verse_error:
                            print(f"⚠️  {surah_name_tr} {verse_num}. ayet hatası: {verse_error}")
                            continue
                    
                    # Insert this surah's verses into MongoDB
                    if surah_verses:
                        result = await verses_collection.insert_many(surah_verses)
                        total_inserted += len(result.inserted_ids)
                        print(f"✅ {surah_name_tr} Suresi kaydedildi ({len(result.inserted_ids)} ayet) - Toplam: {total_inserted}/6236")
                    
                except Exception as e:
                    print(f"❌ {surah_name_tr} Suresi hatası: {e}")
                    continue
            
            # Final summary
            if total_inserted > 0:
                print(f"\n🎉 TAMAMLANDI! {total_inserted} ayet başarıyla veritabanına kaydedildi!")
                print("✅ Tüm veriler Diyanet İşleri Başkanlığı resmi kaynağından alındı.")
            else:
                print("❌ Hiç ayet kaydedilemedi")
                
    except Exception as e:
        print(f"❌ Veri çekme hatası: {e}")
        raise

def get_arabic_surah_name(surah_number: int) -> str:
    """Get Arabic name of surah"""
    arabic_names = {
        1: "الفَاتِحة", 2: "البَقَرَة", 3: "آل عِمرَان", 4: "النِّسَاء", 5: "المَائدة",
        6: "الأنعَام", 7: "الأعرَاف", 8: "الأنفَال", 9: "التوبَة", 10: "يُونس",
        11: "هُود", 12: "يُوسُف", 13: "الرَّعْد", 14: "إبراهِيم", 15: "الحِجْر",
        16: "النَّحْل", 17: "الإسْرَاء", 18: "الكهْف", 19: "مَريَم", 20: "طه",
        21: "الأنبيَاء", 22: "الحَج", 23: "المُؤمنون", 24: "النُّور", 25: "الفُرْقان",
        26: "الشُّعَرَاء", 27: "النَّمْل", 28: "القَصَص", 29: "العَنكبوت", 30: "الرُّوم",
        31: "لقمَان", 32: "السَّجدَة", 33: "الأحزَاب", 34: "سَبَأ", 35: "فَاطِر",
        36: "يس", 37: "الصَّافات", 38: "ص", 39: "الزُّمَر", 40: "غَافِر",
        41: "فُصِّلَتْ", 42: "الشُّورَى", 43: "الزخْرُف", 44: "الدخَان", 45: "الجَاثيَة",
        46: "الأحْقاف", 47: "مُحَمَّد", 48: "الفَتْح", 49: "الحُجُرَات", 50: "ق",
        51: "الذَّاريَات", 52: "الطُّور", 53: "النَّجْم", 54: "القَمَر", 55: "الرَّحْمن",
        56: "الوَاقِعَة", 57: "الحَديد", 58: "المجَادلة", 59: "الحَشر", 60: "المُمتَحنَة",
        61: "الصَّف", 62: "الجُمُعَة", 63: "المنَافِقون", 64: "التَّغَابُن", 65: "الطَّلاق",
        66: "التَّحْريم", 67: "المُلْك", 68: "القَلـَم", 69: "الحَاقَّة", 70: "المعَارج",
        71: "نُوح", 72: "الجِن", 73: "المُزَّمِّل", 74: "المُدَّثِّر", 75: "القِيَامَة",
        76: "الإنسَان", 77: "المُرسَلات", 78: "النَّبَأ", 79: "النَّازعَات", 80: "عَبَس",
        81: "التَّكوير", 82: "الانفِطار", 83: "المطفِّفِين", 84: "الانْشِقاق", 85: "البرُوج",
        86: "الطَّارِق", 87: "الأعْلى", 88: "الغَاشِيَة", 89: "الفَجْر", 90: "البَلَد",
        91: "الشَّمْس", 92: "اللَّيْل", 93: "الضُّحَى", 94: "الشَّرْح", 95: "التِّين",
        96: "العَلَق", 97: "القَدْر", 98: "البَيِّنَة", 99: "الزلزَلة", 100: "العَادِيات",
        101: "القَارِعَة", 102: "التَّكَاثر", 103: "العَصْر", 104: "الهُمَزَة", 105: "الفِيل",
        106: "قُرَيْش", 107: "المَاعُون", 108: "الكَوْثَر", 109: "الكَافِرُون", 110: "النَّصْر",
        111: "المَسَد", 112: "الإخْلَاص", 113: "الفَلَق", 114: "النَّاس"
    }
    return arabic_names.get(surah_number, f"سورة {surah_number}")

def get_revelation_type(surah_number: int) -> str:
    """Get revelation type (Meccan or Medinan)"""
    # Medinan surahs (all others are Meccan)
    medinan_surahs = {2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 110}
    return "Medinan" if surah_number in medinan_surahs else "Meccan"

def get_turkish_surah_name(surah_number: int) -> str:
    """Get Turkish name of surah"""
    surah_names = {
        1: "Fatiha", 2: "Bakara", 3: "Âl-i İmran", 4: "Nisa", 5: "Maide",
        6: "En'am", 7: "A'raf", 8: "Enfal", 9: "Tevbe", 10: "Yunus",
        11: "Hud", 12: "Yusuf", 13: "Ra'd", 14: "İbrahim", 15: "Hicr",
        16: "Nahl", 17: "İsra", 18: "Kehf", 19: "Meryem", 20: "Taha",
        21: "Enbiya", 22: "Hac", 23: "Mü'minun", 24: "Nur", 25: "Furkan",
        26: "Şuara", 27: "Neml", 28: "Kasas", 29: "Ankebut", 30: "Rum",
        31: "Lokman", 32: "Secde", 33: "Ahzab", 34: "Sebe'", 35: "Fatır",
        36: "Yasin", 37: "Saffat", 38: "Sad", 39: "Zümer", 40: "Mü'min",
        41: "Fussilet", 42: "Şura", 43: "Zuhruf", 44: "Duhan", 45: "Casiye",
        46: "Ahkaf", 47: "Muhammed", 48: "Fetih", 49: "Hucurat", 50: "Kaf",
        51: "Zariyat", 52: "Tur", 53: "Necm", 54: "Kamer", 55: "Rahman",
        56: "Vakia", 57: "Hadid", 58: "Mücadele", 59: "Haşr", 60: "Mümtehine",
        61: "Saff", 62: "Cuma", 63: "Münafikun", 64: "Teğabun", 65: "Talak",
        66: "Tahrim", 67: "Mülk", 68: "Kalem", 69: "Hakka", 70: "Mearic",
        71: "Nuh", 72: "Cin", 73: "Müzzemmil", 74: "Müddessir", 75: "Kıyame",
        76: "İnsan", 77: "Mürselat", 78: "Nebe'", 79: "Naziat", 80: "Abese",
        81: "Tekvir", 82: "İnfitar", 83: "Mutaffifin", 84: "İnşikak", 85: "Buruc",
        86: "Tarık", 87: "A'la", 88: "Ğaşiye", 89: "Fecr", 90: "Beled",
        91: "Şems", 92: "Leyl", 93: "Duha", 94: "İnşirah", 95: "Tin",
        96: "Alak", 97: "Kadir", 98: "Beyyine", 99: "Zilzal", 100: "Adiyat",
        101: "Karia", 102: "Tekasür", 103: "Asr", 104: "Hümeze", 105: "Fil",
        106: "Kureyş", 107: "Maun", 108: "Kevser", 109: "Kafirun", 110: "Nasr",
        111: "Tebbet", 112: "İhlas", 113: "Felak", 114: "Nas"
    }
    return surah_names.get(surah_number, f"Sure {surah_number}")

def get_basic_tafsir(surah_number: int, ayah_number: int) -> str:
    """Get basic tafsir/commentary for the verse"""
    
    # Special tafsir for famous verses
    famous_verses = {
        (1, 1): "Besmele, Kuran'ın ve her surenin başlangıcıdır. Allah'ın Rahman ve Rahim isimlerini hatırlatarak, O'nun sonsuz merhameti ve şefkatini vurgular. Müslümanlar her işe besmele ile başlayarak Allah'ı anarlar.",
        
        (1, 2): "Hamd, Allah'a yapılan övgüdür. Sadece O'na hamd edilir çünkü tüm nimetlerin sahibi O'dur. 'Alemlerin Rabbi' ifadesi, Allah'ın tüm varlıkların yaratıcısı ve yöneticisi olduğunu gösterir.",
        
        (2, 255): "Ayetel Kürsi, Kuran'ın en yüce ayetlerinden biridir. Allah'ın birliği, büyüklüğü, ilmi, kudreti ve saltanatını anlatır. Bu ayetin okunması, korunma ve bereket vesilesidir. Hz. Peygamber (s.a.v), bu ayetin Kuran'ın efendisi olduğunu bildirmiştir.",
        
        (112, 1): "İhlas Suresi, tevhid (Allah'ın birliği) inancının özüdür. Allah'ın bir ve tek olduğunu, eşi ve benzerinin bulunmadığını açıklar. Bu sure, Kuran'ın üçte biri değerindedir.",
        
        (112, 2): "Allah Samed'dir, yani herkes O'na muhtaçtır, O ise hiç kimseye muhtaç değildir. Her şey O'ndan ister, O kimseye ihtiyaç duymaz. Tüm varlıklar O'na dayanır.",
        
        (2, 156): "Müminlerin musibetlere karşı tavrını gösterir. 'İnna lillahi ve inna ileyhi raciun' sözü, sabır ve teslimiyetin ifadesidir. Her şeyin Allah'a ait olduğunu ve O'na döneceğimizi hatırlatır.",
        
        (2, 185): "Ramazan ayının Kuran'ın indirildiği ay olduğunu bildirir. Oruç farzının gerekçesini ve kolaylık prensibini açıklar. Allah kullarına zorluk değil, kolaylık ister.",
        
        (55, 13): "Rahman Suresinde tekrarlanan bu ayet, Allah'ın nimetlerini inkâr etmemenin önemini vurgular. Hem dünya hem ahiret nimetlerine şükretmek gerektiğini hatırlatır.",
        
        (36, 1): "Yasin Suresi, Kuran'ın kalbidir. Ölen kişilere, hastalara ve sıkıntıdaki insanlara okunan mübarek bir suredir. Hz. Peygamber (s.a.v), bu surenin okunmasını teşvik etmiştir.",
        
        (18, 10): "Kehf Suresinin başında anlatılan Ashab-ı Kehf kıssasının başlangıcıdır. İmanlarını korumak için mağaraya sığınan gençlerin hikayesi, iman ve sabır derslerini içerir.",
    }
    
    # Check if this is a famous verse
    if (surah_number, ayah_number) in famous_verses:
        return famous_verses[(surah_number, ayah_number)]
    
    # Generate contextual tafsir based on surah
    surah_name = get_turkish_surah_name(surah_number)
    
    # Surah-specific contexts
    surah_contexts = {
        1: "Fatiha Suresi, namazda okunan ve Kuran'ın özeti olan suredir.",
        2: "Bakara Suresi, Kuran'ın en uzun suresidir ve birçok hüküm içerir.",
        3: "Âl-i İmran Suresi, iman ve cihad konularını işler.",
        18: "Kehf Suresi, dört önemli kıssa içerir ve Cuma günleri okunması tavsiye edilir.",
        36: "Yasin Suresi, Kuran'ın kalbi olarak bilinir.",
        55: "Rahman Suresi, Allah'ın nimetlerini sayar.",
        67: "Mülk Suresi, kabir azabından koruyucu olarak bilinir.",
        112: "İhlas Suresi, tevhid inancının özüdür ve Kuran'ın üçte biri değerindedir.",
        113: "Felak Suresi, şerlerden Allah'a sığınmayı öğretir.",
        114: "Nas Suresi, şeytandan ve vesveselerden Allah'a sığınmayı öğretir.",
    }
    
    context = surah_contexts.get(surah_number, f"{surah_name} Suresi, Kuran-ı Kerim'in önemli surelerinden biridir.")
    
    return f"{context} Bu ayet ({surah_name} {ayah_number}), Allah'ın kelâmıdır ve üzerinde tefekkür edilmesi gereken derin mânâlar içerir. Her ayet, hidayet ve öğüt kaynağıdır."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)