# 📱 Gerçek Cihazda Test Rehberi

## 🚀 Hızlı Başlangıç (2 Dakika)

### Adım 1: Expo Go Uygulamasını İndir

**Android:**
- Google Play Store'dan "Expo Go" indir
- https://play.google.com/store/apps/details?id=host.exp.exponent

**iOS:**
- App Store'dan "Expo Go" indir
- https://apps.apple.com/app/expo-go/id982107779

---

### Adım 2: QR Kod ile Bağlan

1. Telefonunuzda **Expo Go** uygulamasını aç
2. **"Scan QR code"** seçeneğine tıkla
3. Aşağıdaki QR kodu tara veya URL'yi gir:

**Web Önizleme URL:**
```
https://versecomment.preview.emergentagent.com
```

**Not:** Web önizleme doğrudan tarayıcıda da açılabilir.

---

## 📋 Test Edilecek Özellikler

### ✅ Ana Sayfa
- [ ] Günün ayeti yükleniyor mu?
- [ ] Arapça metin düzgün görünüyor mu?
- [ ] Türkçe meal okunabiliyor mu?
- [ ] Tefsir bölümü açılıyor mu?

### ✅ Navigasyon
- [ ] Sureler sayfası açılıyor mu?
- [ ] Arama çalışıyor mu?
- [ ] Favoriler sayfası açılıyor mu?
- [ ] İstatistikler görünüyor mu?
- [ ] Ayarlar sayfası açılıyor mu?

### ✅ Favoriler
- [ ] Favorilere ekle butonu çalışıyor mu?
- [ ] Favorilerden çıkar çalışıyor mu?
- [ ] Favoriler listesi güncelleniyor mu?

### ✅ Paylaşım
- [ ] Paylaş butonu tıklanıyor mu?
- [ ] WhatsApp paylaşımı çalışıyor mu?
- [ ] Telegram paylaşımı çalışıyor mu?
- [ ] X (Twitter) paylaşımı çalışıyor mu?
- [ ] Kopyala butonu çalışıyor mu?

### ✅ Tema
- [ ] Açık/Koyu mod değişiyor mu?
- [ ] Tema tercihi kaydediliyor mu?

### ✅ Bildirimler (Sadece Native Build'de)
- [ ] Bildirim izni isteniyor mu?
- [ ] Bildirim saati ayarlanabiliyor mu?

### ✅ Cuma Hatırlatması
- [ ] Cuma günü özel içerik görünüyor mu?
- [ ] "Okudum/Yaptım" butonu çalışıyor mu?

### ✅ Ayarlar
- [ ] Yazı boyutu değiştirilebiliyor mu?
- [ ] Geri bildirim e-posta açılıyor mu?
- [ ] Gizlilik politikası sayfası açılıyor mu?

---

## 🔧 Sorun Giderme

### Uygulama Yüklenmiyor
1. İnternet bağlantınızı kontrol edin
2. Expo Go'yu güncelleyin
3. Telefonunuzu yeniden başlatın

### Sayfa Açılmıyor
1. Swipe ile sayfayı yenileyin (pull-to-refresh)
2. Uygulamayı kapatıp tekrar açın

### Arapça Font Görünmüyor
- iOS ve Android'de sistem fontları kullanılıyor
- Genellikle düzgün görünür

### Bildirimler Çalışmıyor
- Expo Go'da bildirimler sınırlı çalışır
- Tam test için native build gerekir

---

## 📊 Test Sonuçları Kayıt Formu

```
Cihaz: ________________
OS Versiyonu: ________________
Expo Go Versiyonu: ________________
Test Tarihi: ________________

Sonuçlar:
- Ana Sayfa: ✅/❌
- Navigasyon: ✅/❌
- Favoriler: ✅/❌
- Paylaşım: ✅/❌
- Tema: ✅/❌
- Ayarlar: ✅/❌

Notlar:
________________
________________
```

---

## 🚀 Native Build Test (İleri Seviye)

Expo Go yerine tam native deneyim için:

```bash
# APK oluştur (Android)
eas build --platform android --profile preview

# APK'yı indir ve cihaza yükle
```

Bu yöntem:
- Tam bildirim desteği
- Daha hızlı performans
- Store'a yüklenecek versiyona yakın deneyim

---

**Sorularınız için:** destek.rahmetstudio@gmail.com
