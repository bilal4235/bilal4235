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

# Quran.com API base URL (more reliable and verified)
QURAN_API_BASE = "https://api.quran.com/api/v4"

@app.on_event("startup")
async def startup_event():
    """Initialize database with Quran verses if empty"""
    count = await verses_collection.count_documents({})
    if count == 0:
        print("Database is empty. Fetching Quran data...")
        await fetch_and_store_quran_data()
    else:
        print(f"Database already contains {count} verses")

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

async def fetch_and_store_quran_data():
    """Fetch Quran data from Al-Quran API and store in MongoDB"""
    try:
        print("Starting to fetch Quran data...")
        async with httpx.AsyncClient(timeout=30.0) as client:
            verses_to_insert = []
            verse_counter = 1
            
            # Fetch all 114 surahs
            for surah_number in range(1, 115):
                print(f"Fetching Surah {surah_number}/114...")
                
                try:
                    # Get Arabic text
                    arabic_response = await client.get(
                        f"{QURAN_API_BASE}/surah/{surah_number}/ar.alafasy"
                    )
                    arabic_data = arabic_response.json()
                    
                    # Get Turkish translation
                    turkish_response = await client.get(
                        f"{QURAN_API_BASE}/surah/{surah_number}/tr.diyanet"
                    )
                    turkish_data = turkish_response.json()
                    
                    if arabic_data.get("code") == 200 and turkish_data.get("code") == 200:
                        surah_info = arabic_data["data"]
                        turkish_ayahs = turkish_data["data"]["ayahs"]
                        
                        for idx, ayah in enumerate(surah_info["ayahs"]):
                            verse_doc = {
                                "verse_number": verse_counter,
                                "surah_number": surah_number,
                                "surah_name_arabic": surah_info["name"],
                                "surah_name_turkish": get_turkish_surah_name(surah_number),
                                "ayah_number_in_surah": ayah["numberInSurah"],
                                "text_arabic": ayah["text"],
                                "text_turkish": turkish_ayahs[idx]["text"] if idx < len(turkish_ayahs) else "",
                                "tafsir": get_basic_tafsir(surah_number, ayah["numberInSurah"]),
                                "revelation_type": surah_info.get("revelationType", "Meccan"),
                                "created_at": datetime.utcnow()
                            }
                            verses_to_insert.append(verse_doc)
                            verse_counter += 1
                    
                    # Small delay to avoid rate limiting
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    print(f"Error fetching surah {surah_number}: {e}")
                    continue
            
            # Insert all verses into MongoDB
            if verses_to_insert:
                result = await verses_collection.insert_many(verses_to_insert)
                print(f"Successfully inserted {len(result.inserted_ids)} verses into database")
            else:
                print("No verses to insert")
                
    except Exception as e:
        print(f"Error in fetch_and_store_quran_data: {e}")
        raise

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