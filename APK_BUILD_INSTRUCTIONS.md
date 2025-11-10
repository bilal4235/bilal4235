# 📱 Bir Ayet Bir Yorum - APK İndirme Talimatları

## Uygulama Hazır! ✅

Uygulamanız tam olarak hazır ve test edildi. APK dosyasını almak için aşağıdaki adımları takip edin.

---

## 🚀 HIZLI ÇÖZÜM: Expo Go ile Test (2 dakika)

**Bu yöntem en hızlısı ve önerilenidir!**

1. **Expo Go İndirin:**
   - iOS: App Store'dan "Expo Go" indirin
   - Android: Play Store'dan "Expo Go" indirin

2. **Emergent'te Preview Açın:**
   - Emergent platformunda sağ üstteki **"Preview"** butonuna tıklayın
   - Açılan sayfadaki QR kodu Expo Go ile tarayın
   - VEYA URL'i kopyalayıp Expo Go'da manuel girin

3. **Uygulama Açıldı!**
   - Artık telefonunuzda "Bir Ayet Bir Yorum" kullanabilirsiniz

---

## 📦 STANDALONE APK OLUŞTURMA (15-20 dakika)

Gerçek bir APK dosyası istiyorsanız:

### Adım 1: Expo Hesabı Oluşturun

1. https://expo.dev adresine gidin
2. "Sign Up" ile ücretsiz hesap oluşturun
3. Email onaylayın

### Adım 2: EAS CLI Yükleyin

Terminal'de (Emergent platformunda veya bilgisayarınızda):

```bash
npm install -g eas-cli
```

### Adım 3: Expo'ya Giriş Yapın

```bash
cd /app/frontend
eas login
```

Email ve şifrenizi girin.

### Adım 4: Project ID Oluşturun

```bash
eas project:init
```

Bu komut size bir project ID verecek.

### Adım 5: APK Build Başlatın

```bash
eas build --platform android --profile preview
```

**Bu komut:**
- Android APK oluşturacak
- Yaklaşık 10-15 dakika sürecek
- Bittiğinde size bir **download linki** verecek

### Adım 6: APK'yı İndirin

Build tamamlandığında:
1. Verilen linke tıklayın
2. APK dosyasını indirin (yaklaşık 50-100 MB)
3. APK'yı telefonunuza gönderin (email, WhatsApp, USB vb.)
4. Telefonunuzda APK'yı açın ve yükleyin

**Not:** Android'de "Bilinmeyen kaynaklardan uygulama yükleme" izni vermeniz gerekebilir.

---

## 🏪 GOOGLE PLAY STORE'A YÜKLEME

Play Store'da yayınlamak istiyorsanız:

### Gereksinimler:
- Google Play Developer hesabı ($25 tek seferlik)
- Uygulama simgeleri (512x512px)
- Ekran görüntüleri
- Gizlilik politikası

### Adımlar:

1. **Production Build:**
```bash
eas build --platform android --profile production
```

2. **Play Store'a Gönder:**
```bash
eas submit --platform android
```

3. **Play Console'da:**
   - Uygulama bilgilerini doldurun
   - Ekran görüntülerini yükleyin
   - İncelemeye gönderin

---

## 📝 UYGULAMA BİLGİLERİ

**Uygulama Adı:** Bir Ayet Bir Yorum  
**Paket Adı:** com.birayetbiryorum.app  
**Versiyon:** 1.0.0  
**Bundle ID (iOS):** com.birayetbiryorum.app  

**İçerik:**
- 6,236 Kuran ayeti (tam)
- 114 sure (tam)
- Türkçe meal (Diyanet İşleri Başkanlığı)
- Tefsir ve yorumlar
- Günlük bildirimler
- Favori ayetler
- İstatistikler
- Admin panel (PIN: 1234)

---

## 🔧 SORUN GİDERME

**"eas: command not found":**
```bash
npm install -g eas-cli
```

**Build hatası alırsanız:**
```bash
eas build --platform android --profile preview --clear-cache
```

**APK yüklenmiyor:**
- Ayarlar > Güvenlik > Bilinmeyen kaynaklar izni verin

---

## 💡 ÖNERİLER

1. **İlk test için Expo Go kullanın** - En hızlı yöntem
2. **Beğenirseniz APK build yapın** - Standalone uygulama
3. **Ciddi kullanım için Play Store'a yükleyin** - Profesyonel görünüm

---

## 📞 DESTEK

Herhangi bir sorunla karşılaşırsanız:
- Expo dokümanları: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction

---

**Uygulamanız hazır! 🎉**

En hızlı test için: **Expo Go + Preview butonu**  
Standalone APK için: **EAS Build komutları**
