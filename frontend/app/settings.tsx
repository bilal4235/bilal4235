import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState('orta');
  const [arabicFont, setArabicFont] = useState('mushaf');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fridayReminder, setFridayReminder] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showDua, setShowDua] = useState(true);
  const [contentMode, setContentMode] = useState('both');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      setIsDark(theme === 'dark');

      const savedFontSize = await AsyncStorage.getItem('fontSize');
      if (savedFontSize) setFontSize(savedFontSize);

      const savedArabicFont = await AsyncStorage.getItem('arabicFont');
      if (savedArabicFont) setArabicFont(savedArabicFont);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleThemeToggle = async (value: boolean) => {
    setIsDark(value);
    await AsyncStorage.setItem('theme', value ? 'dark' : 'light');
  };

  const handleFontSizeChange = async (size: string) => {
    setFontSize(size);
    await AsyncStorage.setItem('fontSize', size);
  };

  const handleArabicFontChange = async (font: string) => {
    setArabicFont(font);
    await AsyncStorage.setItem('arabicFont', font);
  };

  const colors = isDark ? {
    background: '#1C2A1D',
    surface: '#2A3B2B',
    primary: '#5A8A5C',
    text: '#F5F5DC',
    textSecondary: '#B0B09C',
    border: '#3D4A3E',
    inactive: '#6B776C',
    divider: '#404F41',
  } : {
    background: '#F5F5DC',
    surface: '#FFFFFF',
    primary: '#2C5F2D',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#D4C5A9',
    inactive: '#BBBBBB',
    divider: '#E8E8DC',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Okuma deneyimini düzenle</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. GÖRÜNÜM */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>GÖRÜNÜM</Text>
          
          {/* Gece Modu */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Gece Modu</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          {/* Yazı Boyutu */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingHeader}>
              <Ionicons name="text-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Yazı Boyutu</Text>
            </View>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Arapça ve meal birlikte değişir
            </Text>
            <View style={styles.optionButtons}>
              {['küçük', 'orta', 'büyük'].map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => handleFontSizeChange(size)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: fontSize === size ? colors.primary : 'transparent',
                      borderColor: fontSize === size ? colors.primary : colors.border,
                    }
                  ]}
                >
                  <Text style={[
                    styles.optionButtonText,
                    { color: fontSize === size ? '#FFFFFF' : colors.text }
                  ]}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Arapça Font */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingHeader}>
              <Ionicons name="book-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Arapça Font</Text>
            </View>
            <View style={styles.optionButtons}>
              {['mushaf', 'klasik', 'modern'].map((font) => (
                <TouchableOpacity
                  key={font}
                  onPress={() => handleArabicFontChange(font)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: arabicFont === font ? colors.primary : 'transparent',
                      borderColor: arabicFont === font ? colors.primary : colors.border,
                    }
                  ]}
                >
                  <Text style={[
                    styles.optionButtonText,
                    { color: arabicFont === font ? '#FFFFFF' : colors.text }
                  ]}>
                    {font.charAt(0).toUpperCase() + font.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 2. BİLDİRİMLER */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BİLDİRİMLER</Text>
          
          {/* Günün Ayeti */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Günün Ayeti</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Her gün saat 09:00'da
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          {/* Cuma Hatırlatması */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Cuma Hatırlatması</Text>
              </View>
              <Switch
                value={fridayReminder}
                onValueChange={setFridayReminder}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* 3. İÇERİK TERCİHLERİ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>İÇERİK</Text>
          
          {/* Yorumları Göster */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Yorumları Göster</Text>
              </View>
              <Switch
                value={showComments}
                onValueChange={setShowComments}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          {/* Ayetle Dua */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="hand-right-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Ayetle Dua Bölümü</Text>
              </View>
              <Switch
                value={showDua}
                onValueChange={setShowDua}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          {/* Sadece Arapça / Meal */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingHeader}>
              <Ionicons name="book-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Gösterim Modu</Text>
            </View>
            <View style={styles.optionButtons}>
              {[
                { value: 'arabic', label: 'Sadece Arapça' },
                { value: 'both', label: 'Arapça + Meal' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setContentMode(option.value)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: contentMode === option.value ? colors.primary : 'transparent',
                      borderColor: contentMode === option.value ? colors.primary : colors.border,
                    }
                  ]}
                >
                  <Text style={[
                    styles.optionButtonText,
                    { color: contentMode === option.value ? '#FFFFFF' : colors.text }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 4. HAKKINDA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>HAKKINDA</Text>
          
          {/* Uygulama Amacı */}
          <TouchableOpacity style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Uygulama Amacı</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={colors.inactive} />
            </View>
          </TouchableOpacity>

          {/* Kaynaklar */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingHeader}>
              <Ionicons name="business-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Kaynaklar</Text>
            </View>
            <View style={styles.sourceInfo}>
              <View style={styles.sourceRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                  T.C. Diyanet İşleri Başkanlığı
                </Text>
              </View>
              <View style={styles.sourceRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                  Kur'an Yolu Tefsiri (Meal ve Tefsir)
                </Text>
              </View>
              <View style={styles.sourceRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                  Quran.com (Arapça Metin)
                </Text>
              </View>
            </View>
            <Text style={[styles.sourceDisclaimer, { color: colors.textSecondary }]}>
              Bu uygulamadaki meal ve tefsir içerikleri, Diyanet İşleri Başkanlığı'nın Kur'an Yolu Tefsiri esas alınarak hazırlanmıştır.
            </Text>
          </View>

          {/* Sürüm */}
          <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="code-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Sürüm</Text>
              </View>
              <Text style={[styles.versionText, { color: colors.textSecondary }]}>1.0.0</Text>
            </View>
          </View>

          {/* Geri Bildirim */}
          <TouchableOpacity 
            style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => Alert.alert('Geri Bildirim', 'Bu özellik yakında eklenecek.')}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={24} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Geri Bildirim</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={colors.inactive} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Manevi Kapanış */}
        <View style={styles.spiritualFooter}>
          <Text style={[styles.spiritualText, { color: colors.textSecondary }]}>
            Kur'an hidayettir.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '300',
    marginTop: 2,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  settingCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: Platform.OS === 'ios' ? 18 : 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Platform.OS === 'ios' ? 58 : 54,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    paddingLeft: 36,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sourceInfo: {
    marginTop: 8,
    gap: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceText: {
    fontSize: 13,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  spiritualFooter: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  spiritualText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    opacity: 0.5,
  },
});
