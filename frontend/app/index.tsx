import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

// Theme Context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ColorScheme;
}

interface ColorScheme {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
}

const lightColors: ColorScheme = {
  background: '#F5F5DC',
  surface: '#FFFFFF',
  primary: '#2C5F2D',
  secondary: '#97BC62',
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  border: '#D4C5A9',
  accent: '#D4AF37',
};

const darkColors: ColorScheme = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  primary: '#4A7C4E',
  secondary: '#2C5F2D',
  text: '#F5F5DC',
  textSecondary: '#C0C0A0',
  border: '#3A3A3A',
  accent: '#FFD700',
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Verse {
  verse_number: number;
  surah_number: number;
  surah_name_arabic: string;
  surah_name_turkish: string;
  ayah_number_in_surah: number;
  text_arabic: string;
  text_turkish: string;
  tafsir: string;
  revelation_type: string;
}

export default function App() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load theme preference
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
      }

      // Request notification permissions
      await requestNotificationPermissions();

      // Schedule daily notifications
      await scheduleDailyNotifications();

      // Fetch daily verse
      await fetchDailyVerse();
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Uygulama başlatılamadı');
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!verse) return;
    try {
      const response = await fetch(`${backendUrl}/api/favorites/check/${verse.verse_number}`);
      const data = await response.json();
      setIsFavorite(data.is_favorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!verse) return;
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await fetch(`${backendUrl}/api/favorites/${verse.verse_number}`, {
          method: 'DELETE',
        });
        setIsFavorite(false);
        Alert.alert('Başarılı', 'Favorilerden çıkarıldı');
      } else {
        // Add to favorites
        await fetch(`${backendUrl}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verse_id: verse.verse_number }),
        });
        setIsFavorite(true);
        Alert.alert('Başarılı', 'Favorilere eklendi');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
    }
  };

  const shareVerse = async () => {
    if (!verse) return;
    
    try {
      const message = `🌙 Bir Ayet Bir Yorum\n\n${verse.text_arabic}\n\n${verse.text_turkish}\n\n${verse.surah_name_turkish} Suresi - ${verse.ayah_number_in_surah}. Ayet`;
      
      await Share.share({
        message,
      });
      
      // Record reading when shared
      await fetch(`${backendUrl}/api/reading-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verse_id: verse.verse_number }),
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      if (Platform.OS === 'web') return;
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
      }
    } catch (err) {
      console.error('Error requesting notification permissions:', err);
    }
  };

  const scheduleDailyNotifications = async () => {
    if (Platform.OS === 'web') {
      console.log('Notifications not available on web platform');
      return;
    }

    try {
      // Get saved notification time or use default (00:00)
      const savedTime = await AsyncStorage.getItem('notificationTime');
      const time = savedTime ? JSON.parse(savedTime) : { hour: 0, minute: 0 };

      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule daily notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Günün Ayeti',
          body: 'Bugünün ayetini okumak için uygulamayı açın',
          sound: true,
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });

      console.log('Daily notifications scheduled successfully');
    } catch (err) {
      console.error('Error scheduling notifications:', err);
    }
  };

  const fetchDailyVerse = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${backendUrl}/api/verse/daily`);
      
      if (!response.ok) {
        throw new Error('Ayet yüklenemedi');
      }

      const data = await response.json();
      setVerse(data);
    } catch (err) {
      console.error('Error fetching verse:', err);
      setError('Ayet yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const colors = isDark ? darkColors : lightColors;
  const themeValue = { isDark, toggleTheme, colors };

  return (
    <ThemeContext.Provider value={themeValue}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.appTitle, { color: colors.text }]}>Bir Ayet Bir Yorum</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => router.push('/browse')}
              style={[styles.iconButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons name="book" size={20} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/search')}
              style={[styles.iconButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/favorites')}
              style={[styles.iconButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons name="heart" size={20} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/statistics')}
              style={[styles.iconButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons name="stats-chart" size={20} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={[styles.iconButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons name="settings" size={20} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.iconButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={20}
                color={colors.surface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Ayet yükleniyor...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle" size={48} color={colors.primary} />
              <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              <TouchableOpacity
                onPress={fetchDailyVerse}
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.retryButtonText, { color: colors.surface }]}>
                  Tekrar Dene
                </Text>
              </TouchableOpacity>
            </View>
          ) : verse ? (
            <View style={styles.verseContainer}>
              {/* Surah Info */}
              <View style={[styles.surahInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.surahHeader}>
                  <Ionicons name="star" size={20} color={colors.accent} />
                  <Text style={[styles.surahName, { color: colors.text }]}>
                    {verse.surah_name_turkish}
                  </Text>
                </View>
                <Text style={[styles.surahDetails, { color: colors.textSecondary }]}>
                  {verse.surah_number}. Sure • {verse.ayah_number_in_surah}. Ayet
                </Text>
                <Text style={[styles.surahNameArabic, { color: colors.primary }]}>
                  {verse.surah_name_arabic}
                </Text>
              </View>

              {/* Arabic Text */}
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
                  <Ionicons name="book-outline" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>Arapça Metin</Text>
                </View>
                <Text style={[styles.arabicText, { color: colors.text }]}>
                  {verse.text_arabic}
                </Text>
              </View>

              {/* Spacer */}
              <View style={styles.spacer} />

              {/* Turkish Translation */}
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
                  <Ionicons name="language" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>Türkçe Meal (Diyanet)</Text>
                </View>
                <Text style={[styles.turkishText, { color: colors.text }]}>
                  {verse.text_turkish}
                </Text>
              </View>

              {/* Spacer */}
              <View style={styles.spacer} />

              {/* Tafsir */}
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
                  <Ionicons name="bulb-outline" size={18} color={colors.accent} />
                  <Text style={[styles.sectionTitle, { color: colors.accent }]}>Tefsir ve Yorum</Text>
                </View>
                <Text style={[styles.tafsirText, { color: colors.text }]}>
                  {verse.tafsir}
                </Text>
              </View>

              {/* Footer Info */}
              <View style={styles.footerInfo}>
                <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  Diyanet İşleri Başkanlığı resmi kaynağı
                </Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  verseContainer: {
    gap: 0,
  },
  surahInfo: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  surahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  surahName: {
    fontSize: 24,
    fontWeight: '700',
  },
  surahDetails: {
    fontSize: 14,
    marginBottom: 12,
  },
  surahNameArabic: {
    fontSize: 28,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  arabicText: {
    fontSize: 28,
    lineHeight: 48,
    textAlign: 'right',
    padding: 20,
    fontWeight: '500',
  },
  turkishText: {
    fontSize: 18,
    lineHeight: 30,
    padding: 20,
  },
  tafsirText: {
    fontSize: 16,
    lineHeight: 26,
    padding: 20,
  },
  spacer: {
    height: 24,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});