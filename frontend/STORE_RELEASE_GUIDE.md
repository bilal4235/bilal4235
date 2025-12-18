# 📱 İlmihal Asistanı - Mağaza Yükleme Rehberi

## 📋 Uygulama Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Uygulama Adı** | İlmihal Asistanı |
| **Paket ID** | com.ilmihal.asistani |
| **Versiyon** | 1.0.0 |
| **Açıklama** | Diyanet İşleri Başkanlığı kaynaklı İslami ilmihal soruları ve cevapları |

---

## 🍎 Apple App Store (iOS)

### Gereksinimler:
- Mac bilgisayar (Xcode için zorunlu)
- Apple Developer hesabı ($99/yıl)
- Xcode (App Store'dan ücretsiz)

### Adımlar:

1. **Projeyi Mac'e Kopyalayın**
   ```bash
   # frontend klasörünü Mac'e indirin
   ```

2. **Xcode ile Açın**
   ```bash
   cd frontend/ios/App
   open App.xcworkspace
   ```

3. **CocoaPods Yükleyin**
   ```bash
   cd frontend/ios/App
   pod install
   ```

4. **Signing & Capabilities**
   - Xcode'da projeyi seçin
   - "Signing & Capabilities" sekmesine gidin
   - Team: Apple Developer hesabınızı seçin
   - Bundle Identifier: com.ilmihal.asistani

5. **App Icons Ekleyin**
   - Assets.xcassets > AppIcon
   - Gerekli boyutlar: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

6. **Archive ve Yükleme**
   - Product > Archive
   - Distribute App > App Store Connect
   - Upload

7. **App Store Connect**
   - https://appstoreconnect.apple.com
   - Uygulama bilgilerini doldurun
   - Screenshot'ları yükleyin
   - Review'a gönderin

---

## 🤖 Google Play Store (Android)

### Gereksinimler:
- Google Play Developer hesabı ($25 tek seferlik)
- Android Studio veya komut satırı araçları

### Adımlar:

1. **Release APK/AAB Oluşturun**
   ```bash
   cd frontend/android
   
   # Debug APK (test için)
   ./gradlew assembleDebug
   # Çıktı: app/build/outputs/apk/debug/app-debug.apk
   
   # Release AAB (mağaza için)
   ./gradlew bundleRelease
   # Çıktı: app/build/outputs/bundle/release/app-release.aab
   ```

2. **Signing Key Oluşturun**
   ```bash
   keytool -genkey -v -keystore ilmihal-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ilmihal
   ```

3. **Release Build İmzalayın**
   - android/app/build.gradle dosyasına signing config ekleyin
   - veya Android Studio ile imzalayın

4. **Google Play Console**
   - https://play.google.com/console
   - Yeni uygulama oluşturun
   - AAB dosyasını yükleyin
   - Mağaza listesini doldurun
   - Screenshot'ları ekleyin
   - Review'a gönderin

---

## 📸 Gerekli Görseller

### App Store (iOS):
- iPhone 6.7" Screenshot: 1290 x 2796 px
- iPhone 6.5" Screenshot: 1284 x 2778 px
- iPhone 5.5" Screenshot: 1242 x 2208 px
- iPad Pro 12.9" Screenshot: 2048 x 2732 px
- App Icon: 1024 x 1024 px

### Play Store (Android):
- Feature Graphic: 1024 x 500 px
- Hi-res Icon: 512 x 512 px
- Phone Screenshot: 1080 x 1920 px (min)
- 7" Tablet Screenshot: 1200 x 1920 px
- 10" Tablet Screenshot: 1920 x 1200 px

---

## 📝 Mağaza Açıklaması (Örnek)

### Kısa Açıklama (80 karakter):
İslami ilmihal bilgileri, quiz ve hatırlatıcılar - Diyanet kaynaklı

### Uzun Açıklama:
İlmihal Asistanı, Müslümanların günlük dini yaşamlarında ihtiyaç duydukları tüm bilgilere kolayca ulaşmalarını sağlayan kapsamlı bir uygulamadır.

📚 **219 Soru-Cevap**
Namaz, oruç, zekât, hac, günlük yaşam, dua ve iman konularında detaylı bilgiler.

🎯 **Mini Quiz**
Bilgilerinizi test edin ve öğrenmenizi pekiştirin.

📅 **İslami Takvim**
2025 yılı kandil, bayram ve önemli günleri.

🔔 **Hatırlatıcılar**
5 vakit namaz ve dua hatırlatıcıları.

⚙️ **Kişiselleştirme**
Tema, yazı boyutu ve renk ayarları.

✅ **Güvenilir Kaynak**
Tüm içerikler Diyanet İşleri Başkanlığı kaynaklarından alınmıştır.

---

## 🔑 Anahtar Kelimeler

islam, ilmihal, diyanet, namaz, oruç, zekat, hac, dua, kuran, müslüman, ibadet, kandil, ramazan, bayram, helal, haram, abdest, gusül, fıkıh

---

## ⚠️ Önemli Notlar

1. **Gizlilik Politikası**: Mağazalar gizlilik politikası URL'si ister
2. **Yaş Sınırı**: 4+ (Apple) / Everyone (Google)
3. **Kategori**: Reference / Books & Reference
4. **İletişim**: Destek e-posta adresi gerekli

---

## 🆘 Sorun mu Yaşıyorsunuz?

Capacitor resmi dokümantasyonu:
- https://capacitorjs.com/docs/ios
- https://capacitorjs.com/docs/android

Apple Developer:
- https://developer.apple.com/app-store/review/guidelines/

Google Play:
- https://play.google.com/console/about/guides/releasewithconfidence/
