# 🚀 Bir Ayet Bir Yorum - Build ve Yayınlama Rehberi

## 📋 Ön Gereksinimler

### Hesaplar
- [ ] **Apple Developer Account** ($99/yıl) - https://developer.apple.com
- [ ] **Google Play Console** ($25 tek seferlik) - https://play.google.com/console
- [ ] **Expo Account** (Ücretsiz) - https://expo.dev

### Araçlar
```bash
# Node.js ve npm yüklü olmalı
node -v  # v18+ önerilir

# EAS CLI yükle
npm install -g eas-cli

# Expo hesabına giriş yap
eas login
```

---

## 🍎 iOS (App Store) Build

### Adım 1: Apple Developer Ayarları
1. https://developer.apple.com/account adresine git
2. **Certificates, Identifiers & Profiles** bölümüne gir
3. **App IDs** altında yeni bir ID oluştur:
   - Bundle ID: `com.rahmetstudio.birayetbiryorum`
   - Capabilities: Push Notifications ✅

### Adım 2: App Store Connect
1. https://appstoreconnect.apple.com adresine git
2. **My Apps** > **+** > **New App**
3. Bilgileri doldur:
   - Platform: iOS
   - Name: Bir Ayet Bir Yorum
   - Primary Language: Turkish
   - Bundle ID: com.rahmetstudio.birayetbiryorum
   - SKU: birayetbiryorum001

### Adım 3: iOS Build
```bash
cd /app/frontend

# Production build oluştur
eas build --platform ios --profile production

# Build tamamlandığında .ipa dosyası indir
```

### Adım 4: App Store'a Yükle
```bash
# EAS Submit ile otomatik yükle
eas submit --platform ios

# Veya manuel olarak Transporter uygulaması ile yükle
```

### Adım 5: App Store Connect'te Tamamla
1. **App Information** bölümünü doldur
2. **Pricing and Availability** - Ücretsiz seç
3. **App Privacy** - Veri toplamıyoruz seç
4. **Screenshots** yükle (store-metadata/screenshots klasöründen)
5. **Description** ekle (store-metadata/STORE_LISTING_TR.md'den)
6. **Submit for Review**

---

## 🤖 Android (Google Play) Build

### Adım 1: Google Play Console Ayarları
1. https://play.google.com/console adresine git
2. **Create App** tıkla
3. Bilgileri doldur:
   - App name: Bir Ayet Bir Yorum
   - Default language: Turkish
   - App or game: App
   - Free or paid: Free

### Adım 2: Android Build
```bash
cd /app/frontend

# AAB (App Bundle) oluştur - Play Store için
eas build --platform android --profile production

# APK oluştur - Test için
eas build --platform android --profile preview
```

### Adım 3: Signing Key
EAS otomatik olarak signing key oluşturur. Key'i güvenli bir yerde sakla:
```bash
# Key bilgilerini görüntüle
eas credentials
```

### Adım 4: Google Play'e Yükle
```bash
# EAS Submit ile otomatik yükle
eas submit --platform android

# Veya manuel olarak:
# 1. Play Console > Production > Create new release
# 2. AAB dosyasını yükle
```

### Adım 5: Store Listing Tamamla
1. **Main store listing** - Türkçe açıklama ekle
2. **Graphics** - Screenshots ve Feature Graphic yükle
3. **Categorization** - Books & Reference seç
4. **Contact details** - E-posta ekle
5. **Privacy policy** - URL ekle

### Adım 6: Content Rating
1. **Policy** > **App content** > **Content rating**
2. Anketi doldur (Şiddet yok, Cinsel içerik yok, vs.)
3. **IARC** sertifikası otomatik oluşturulur

### Adım 7: Data Safety
1. **Policy** > **App content** > **Data safety**
2. "Veri toplamıyoruz" seçeneğini işaretle

### Adım 8: Yayınla
1. **Production** > **Countries/regions** - Tüm ülkeler seç
2. **Review and release** tıkla

---

## 📁 Hazır Dosyalar

### Store Metadata
- `store-metadata/STORE_LISTING_TR.md` - Türkçe açıklama
- `store-metadata/STORE_LISTING_EN.md` - İngilizce açıklama
- `store-metadata/STORE_LISTING_AR.md` - Arapça açıklama
- `store-metadata/feature_graphic.png` - Google Play banner (1024x500)
- `store-metadata/APP_REVIEW_INFO.md` - İnceleme bilgileri

### Assets
- `assets/images/icon.png` - App icon (1024x1024)
- `assets/images/adaptive-icon.png` - Android adaptive icon
- `assets/images/favicon.png` - Web favicon

### Gizlilik Politikası
- Uygulama içi: `/privacy` sayfası
- URL: `https://[your-domain]/privacy`

---

## ⚡ Hızlı Komutlar

```bash
# Tüm platformlar için build
eas build --platform all --profile production

# Sadece iOS
eas build --platform ios --profile production

# Sadece Android
eas build --platform android --profile production

# Test build (APK)
eas build --platform android --profile preview

# Submit (yükleme)
eas submit --platform ios
eas submit --platform android

# Build durumunu kontrol et
eas build:list
```

---

## 🔧 Sorun Giderme

### iOS Build Hatası
```bash
# Credentials'ı sıfırla
eas credentials --platform ios

# Cache temizle
rm -rf node_modules
yarn install
```

### Android Build Hatası
```bash
# Keystore sorunları için
eas credentials --platform android

# Gradle cache temizle
cd android && ./gradlew clean
```

### EAS Bağlantı Sorunları
```bash
# Yeniden giriş yap
eas logout
eas login

# Project ID güncelle
eas init
```

---

## 📞 Destek

- **E-posta:** destek.rahmetstudio@gmail.com
- **Expo Docs:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/

---

## ✅ Checklist

### App Store
- [ ] Apple Developer hesabı
- [ ] App Store Connect'te uygulama oluştur
- [ ] iOS build al
- [ ] Screenshots yükle
- [ ] Açıklama ekle
- [ ] Privacy policy URL ekle
- [ ] İncelemeye gönder

### Google Play
- [ ] Play Console hesabı
- [ ] Uygulama oluştur
- [ ] Android build al (AAB)
- [ ] Store listing doldur
- [ ] Screenshots yükle
- [ ] Feature graphic yükle
- [ ] Content rating tamamla
- [ ] Data safety doldur
- [ ] Yayınla

---

**Son Güncelleme:** 17 Aralık 2024
**Versiyon:** 1.0.0
