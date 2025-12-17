import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SUPPORT_EMAIL = 'destek.rahmetstudio@gmail.com';
const LAST_UPDATED = '17 Aralık 2024';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Gizlilik Politikası Hakkında`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C5F2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gizlilik Politikası</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Bir Ayet Bir Yorum</Text>
          <Text style={styles.updateDate}>Son güncelleme: {LAST_UPDATED}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giriş</Text>
          <Text style={styles.paragraph}>
            "Bir Ayet Bir Yorum" uygulaması, Rahmet Studio tarafından geliştirilmiştir. 
            Kullanıcılarımızın gizliliğine saygı duyuyor ve kişisel verilerinizin 
            korunmasını öncelikli olarak değerlendiriyoruz.
          </Text>
          <Text style={styles.paragraph}>
            Bu gizlilik politikası, uygulamamızı kullandığınızda hangi bilgilerin 
            toplandığını, nasıl kullanıldığını ve korunduğunu açıklamaktadır.
          </Text>
        </View>

        {/* Data Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toplanan Veriler</Text>
          
          <View style={styles.bulletPoint}>
            <Ionicons name="checkmark-circle" size={18} color="#2C5F2D" />
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Yerel Depolama Verileri</Text>
              <Text style={styles.bulletText}>
                Tema tercihi, yazı boyutu, bildirim ayarları ve favori ayetler 
                yalnızca cihazınızda saklanır.
              </Text>
            </View>
          </View>

          <View style={styles.bulletPoint}>
            <Ionicons name="checkmark-circle" size={18} color="#2C5F2D" />
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Okuma Geçmişi</Text>
              <Text style={styles.bulletText}>
                Okuduğunuz ayetlerin kaydı, istatistik özelliği için tutulur. 
                Bu veriler anonim olup kişisel bilgi içermez.
              </Text>
            </View>
          </View>

          <View style={styles.bulletPoint}>
            <Ionicons name="checkmark-circle" size={18} color="#2C5F2D" />
            <View style={styles.bulletContent}>
              <Text style={styles.bulletTitle}>Bildirim İzinleri</Text>
              <Text style={styles.bulletText}>
                Günlük ayet hatırlatmaları için bildirim izni talep edilir. 
                Bu tamamen isteğe bağlıdır.
              </Text>
            </View>
          </View>
        </View>

        {/* Data Not Collected */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toplanmayan Veriler</Text>
          <Text style={styles.paragraph}>
            Uygulamamız aşağıdaki verileri <Text style={styles.bold}>toplamaz</Text>:
          </Text>
          
          <View style={styles.notCollectedList}>
            <Text style={styles.notCollectedItem}>• Kişisel kimlik bilgileri (ad, e-posta, telefon)</Text>
            <Text style={styles.notCollectedItem}>• Konum bilgisi</Text>
            <Text style={styles.notCollectedItem}>• Cihaz tanımlayıcıları</Text>
            <Text style={styles.notCollectedItem}>• Finansal bilgiler</Text>
            <Text style={styles.notCollectedItem}>• Üçüncü taraf hesap bilgileri</Text>
          </View>
        </View>

        {/* Data Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verilerin Kullanımı</Text>
          <Text style={styles.paragraph}>
            Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:
          </Text>
          <View style={styles.usageList}>
            <Text style={styles.usageItem}>• Kullanıcı tercihlerinin hatırlanması</Text>
            <Text style={styles.usageItem}>• Okuma istatistiklerinin gösterilmesi</Text>
            <Text style={styles.usageItem}>• Favori ayetlerin saklanması</Text>
            <Text style={styles.usageItem}>• Bildirim gönderimi (izin verilmişse)</Text>
          </View>
        </View>

        {/* Third Party */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Üçüncü Taraf Paylaşımı</Text>
          <Text style={styles.paragraph}>
            Verileriniz hiçbir üçüncü tarafla paylaşılmaz, satılmaz veya kiralanmaz. 
            Uygulama, reklam içermemektedir.
          </Text>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veri Güvenliği</Text>
          <Text style={styles.paragraph}>
            Tüm veriler cihazınızda yerel olarak saklanır. Sunucularımıza 
            kişisel veri aktarımı yapılmamaktadır. Ayet ve tefsir içerikleri 
            Diyanet İşleri Başkanlığı'nın açık kaynak API'sinden alınmaktadır.
          </Text>
        </View>

        {/* Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çocukların Gizliliği</Text>
          <Text style={styles.paragraph}>
            Uygulamamız her yaş grubuna uygundur ve çocuklardan özel olarak 
            veri toplamaz. Uygulama, eğitici ve manevî içerik sunmaktadır.
          </Text>
        </View>

        {/* User Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kullanıcı Hakları</Text>
          <Text style={styles.paragraph}>
            Kullanıcılar aşağıdaki haklara sahiptir:
          </Text>
          <View style={styles.usageList}>
            <Text style={styles.usageItem}>• Yerel verileri silme (uygulama ayarlarından)</Text>
            <Text style={styles.usageItem}>• Bildirimleri kapatma</Text>
            <Text style={styles.usageItem}>• Uygulamayı kaldırarak tüm verileri silme</Text>
          </View>
        </View>

        {/* Content Source */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İçerik Kaynağı</Text>
          <Text style={styles.paragraph}>
            Uygulamadaki meal ve tefsir içerikleri, T.C. Diyanet İşleri 
            Başkanlığı'nın "Kur'an Yolu Tefsiri" esas alınarak hazırlanmıştır. 
            Arapça metinler Quran.com açık kaynak API'sinden alınmaktadır.
          </Text>
        </View>

        {/* Changes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Politika Değişiklikleri</Text>
          <Text style={styles.paragraph}>
            Bu gizlilik politikası zaman zaman güncellenebilir. Önemli 
            değişiklikler uygulama içinden bildirilecektir. Güncel politikayı 
            bu sayfadan takip edebilirsiniz.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          <Text style={styles.paragraph}>
            Gizlilik politikamız hakkında sorularınız için bizimle iletişime 
            geçebilirsiniz:
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={openEmail}>
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Rahmet Studio. Tüm hakları saklıdır.
          </Text>
          <Text style={styles.footerSubtext}>
            Bir Ayet Bir Yorum - Her gün bir ayet, bir tefekkür
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5DC',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5A9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5A9',
    marginBottom: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C5F2D',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 13,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C5F2D',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 4,
  },
  bulletContent: {
    flex: 1,
    marginLeft: 12,
  },
  bulletTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4A4A4A',
  },
  notCollectedList: {
    backgroundColor: '#FFF8E7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  notCollectedItem: {
    fontSize: 14,
    lineHeight: 24,
    color: '#333333',
  },
  usageList: {
    paddingLeft: 8,
  },
  usageItem: {
    fontSize: 14,
    lineHeight: 26,
    color: '#333333',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C5F2D',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#D4C5A9',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
  },
});
