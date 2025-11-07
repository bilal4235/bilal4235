# Bir Ayet Bir Yorum - Deployment Kılavuzu

## 📱 Uygulama Hakkında

**Bir Ayet Bir Yorum** - Her gün bir Kuran ayeti, tefsiri ve meal ile İslami mobil uygulama.

### Özellikler
✅ Günlük ayet gösterimi (Diyanet İşleri Başkanlığı kaynağı)
✅ 6,236 ayet tam veritabanı
✅ Arapça metin + Türkçe meal + Tefsir
✅ Arama özelliği (ayet ve sure)
✅ Kuran okuma (tüm sureler)
✅ Günlük bildirimler
✅ Light/Dark tema
✅ Ayarlar (bildirim zamanı)

## 🏗️ Teknoloji Stack

**Frontend:**
- Expo (React Native)
- Expo Router (File-based routing)
- TypeScript
- AsyncStorage
- Expo Notifications

**Backend:**
- FastAPI (Python)
- MongoDB
- Motor (Async MongoDB driver)
- CORS enabled

**Data Source:**
- Quran.com API (Arabic Uthmani text)
- Diyanet İşleri Başkanlığı API (Turkish meal & tafsir)

## 📋 Gereksinimler

### Yerel Geliştirme
- Node.js 18+
- Python 3.9+
- MongoDB
- Expo CLI
- Yarn veya npm

## 🚀 Deployment Seçenekleri

### 1. Emergent Platform (Mevcut)
Uygulama şu anda Emergent platformunda çalışıyor ve hazır durumda.

**Mevcut URL'ler:**
- Frontend Preview: Emergent tarafından sağlanan URL
- Backend API: `/api/*` endpoints
- MongoDB: Platforma özel bağlantı

### 2. Expo Application Services (EAS)

#### EAS Build ve Yayınlama

**Adım 1: EAS CLI Kurulumu**
```bash
npm install -g eas-cli
```

**Adım 2: Expo Hesabı ile Giriş**
```bash
eas login
```

**Adım 3: Projeyi Yapılandır**
```bash
cd frontend
eas build:configure
```

**Adım 4: Android Build (APK)**
```bash
eas build --platform android --profile preview
```

**Adım 5: iOS Build (TestFlight)**
```bash
eas build --platform ios --profile preview
```

**Adım 6: Production Build**
```bash
# Android için Google Play Store
eas build --platform android --profile production

# iOS için App Store
eas build --platform ios --profile production
```

**Adım 7: Submit to Stores**
```bash
# Android
eas submit --platform android

# iOS
eas submit --platform ios
```

### 3. Standalone Build (Kendi Sunucunuzda)

#### Backend Deployment

**Docker ile (Önerilen):**
```bash
# Backend için Dockerfile oluşturun
cd backend

# Docker image build
docker build -t bir-ayet-biryorum-backend .

# Container çalıştır
docker run -d -p 8001:8001 \
  -e MONGO_URL=mongodb://your-mongo-url \
  bir-ayet-biryorum-backend
```

**Doğrudan Python:**
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

#### Frontend Deployment

**Web Build:**
```bash
cd frontend
npx expo export --platform web
```

**Mobil Build (Local):**
```bash
# Android APK
npx expo build:android

# iOS IPA
npx expo build:ios
```

## ⚙️ Konfigürasyon

### Environment Variables

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017
```

**Frontend (.env):**
```env
EXPO_PUBLIC_BACKEND_URL=https://your-api-domain.com
```

### app.json Güncelleme

`frontend/app.json` dosyasında:
- `extra.eas.projectId`: EAS project ID'nizi ekleyin
- `ios.bundleIdentifier`: iOS için unique identifier
- `android.package`: Android için unique package name

## 📱 Store Yayınlama

### Google Play Store

**Gereksinimler:**
1. Google Play Developer hesabı ($25 tek seferlik)
2. Uygulama ikonu (512x512px)
3. Ekran görüntüleri (telefon, tablet)
4. Uygulama açıklaması (Türkçe ve İngilizce)
5. Gizlilik politikası URL'si

**Build Type:**
- AAB (Android App Bundle) formatı önerilen
- `eas build --platform android --profile production`

### Apple App Store

**Gereksinimler:**
1. Apple Developer Program ($99/yıl)
2. Uygulama ikonu (1024x1024px)
3. Ekran görüntüleri (çeşitli iPhone boyutları)
4. Uygulama açıklaması (Türkçe ve İngilizce)
5. Gizlilik politikası URL'si

**Build Type:**
- IPA formatı
- `eas build --platform ios --profile production`

## 🔐 Önemli Notlar

### MongoDB Bağlantısı
- Production'da MongoDB Atlas kullanmanız önerilir
- Güvenlik için IP whitelist ayarlayın
- Database credentials'ları environment variables olarak saklayın

### API Güvenliği
- CORS ayarlarını production için daraltın
- Rate limiting ekleyin (opsiyonel)
- HTTPS kullanın

### Bildirimler
- iOS için Apple Push Notification (APN) sertifikası gerekli
- Android için Firebase Cloud Messaging (FCM) kurulumu otomatik

## 📊 Backend API Endpoints

```
GET  /api/health           # Sağlık kontrolü
GET  /api/stats            # İstatistikler (toplam ayet sayısı)
GET  /api/verse/daily      # Günün ayeti
GET  /api/verse/{id}       # Belirli ayet
GET  /api/surah/{id}       # Belirli sure
GET  /api/surahs           # Tüm sureleri listele
GET  /api/search?q={query} # Ayet/sure arama
```

## 🧪 Test

**Backend Test:**
```bash
cd backend
pytest
```

**Frontend Test:**
```bash
cd frontend
yarn test
```

## 📞 Destek ve Daha Fazla Bilgi

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction
- React Native: https://reactnative.dev

## 📝 Lisans

Bu proje Diyanet İşleri Başkanlığı resmi kaynaklarını kullanmaktadır.

---

**Son Güncelleme:** 2025
**Versiyon:** 1.0.0
