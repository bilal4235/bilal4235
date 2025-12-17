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
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState('orta');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      setIsDark(theme === 'dark');

      const savedFontSize = await AsyncStorage.getItem('fontSize');
      if (savedFontSize) {
        setFontSize(savedFontSize);
      }

      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      if (notifications !== null) {
        setNotificationsEnabled(notifications === 'true');
      }
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
    Alert.alert('Başarılı', 'Yazı boyutu değiştirildi. Uygulamayı yeniden başlatın.');
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', value.toString());
    
    if (value) {
      // Schedule notifications
      await scheduleNotifications();
      Alert.alert('Bildirimler Açıldı', 'Her gün saat 09:00\'da hatırlatma alacaksınız.');
    } else {
      // Cancel all notifications
      if (Platform.OS !== 'web') {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
      Alert.alert('Bildirimler Kapatıldı', 'Günlük hatırlatmalar durduruldu.');
    }
  };

  const scheduleNotifications = async () => {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Günün Ayeti 📖',
          body: 'Bugünün ayeti sizi bekliyor.',
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const colors = isDark ? {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    primary: '#4A7C4E',
    text: '#F5F5DC',
    textSecondary: '#C0C0A0',
    border: '#3A3A3A',
  } : {
    background: '#F5F5DC',
    surface: '#FFFFFF',
    primary: '#2C5F2D',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    border: '#D4C5A9',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Diyanet Logo/Banner */}
        <View style={[styles.diyanetBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.diyanetText}>T.C. Diyanet İşleri Başkanlığı</Text>
          <Text style={styles.diyanetSubtext}>Resmi Kaynak</Text>
        </View>

        {/* Görünüm Ayarları */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Görünüm</Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Gece Modu</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#D4C5A9', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="text" size={22} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Yazı Boyutu</Text>
            </View>
          </View>

          <View style={styles.fontSizeButtons}>
            {['küçük', 'orta', 'büyük'].map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => handleFontSizeChange(size)}
                style={[
                  styles.fontSizeButton,
                  { 
                    backgroundColor: fontSize === size ? colors.primary : colors.surface,
                    borderColor: colors.border
                  }
                ]}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  { color: fontSize === size ? '#FFFFFF' : colors.text }
                ]}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bildirim Ayarları */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bildirimler</Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Günlük Hatırlatma</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Her gün saat 09:00'da
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#D4C5A9', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Hakkında */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
          
          <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Uygulama</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>Bir Ayet Bir Yorum</Text>
            </View>
            
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Versiyon</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
            </View>
            
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Kaynak</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>Diyanet İşleri Başkanlığı</Text>
            </View>
            
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Ayet Sayısı</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>6,236</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Bu uygulama T.C. Diyanet İşleri Başkanlığı'nın
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            resmi kaynaklarını kullanmaktadır.
          </Text>
          <View style={styles.footerIcon}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={[styles.footerBadge, { color: colors.primary }]}>Resmi Kaynak</Text>
          </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  content: {
    flex: 1,
  },
  diyanetBanner: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  diyanetText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  diyanetSubtext: {
    fontSize: 12,
    color: '#F5F5DC',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingLeft: 34,
  },
  fontSizeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0E8',
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(44, 95, 45, 0.1)',
  },
  footerBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
});
