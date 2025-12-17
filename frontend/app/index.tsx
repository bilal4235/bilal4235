import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
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
  Modal,
  Dimensions,
  Linking,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter, usePathname } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Cuma İçerikleri - Dönüşümlü olarak gösterilecek
const FRIDAY_CONTENTS = [
  {
    type: 'ayet',
    title: 'Cuma Ayeti',
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ',
    text: '"Ey iman edenler! Cuma günü namaza çağrıldığınızda Allah\'ı anmaya koşun."',
    source: 'Cum\'a Suresi, 9',
    comment: 'Bugün kalbimizi ve vaktimizi Allah için ayıralım. Cuma, haftanın muhasebe günüdür.',
  },
  {
    type: 'dua',
    title: 'Cuma Duası',
    text: '"Allah\'ım bu cumayı bize mağfiret, ailemize huzur, ümmete ferahlık eyle."',
    comment: 'Cuma günü yapılan dualar kabul olunur.',
  },
  {
    type: 'bilgi',
    title: 'Cuma Bilgisi',
    text: 'Cuma günü yapılan duaların kabulüne vesile olan özel bir vakit vardır.',
    comment: 'Hz. Peygamber (s.a.v) bu vaktin ikindi sonrası olduğunu bildirmiştir.',
  },
  {
    type: 'amel',
    title: 'Bugünkü Amel',
    text: 'Bugün bol bol salavat getir.',
    comment: '"Kim bana bir salavat getirirse, Allah ona on rahmet eder." (Müslim)',
  },
  {
    type: 'ayet',
    title: 'Cuma Ayeti',
    arabic: 'فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ',
    text: '"Namaz kılınınca yeryüzüne dağılın ve Allah\'ın lütfundan nasibinizi arayın."',
    source: 'Cum\'a Suresi, 10',
    comment: 'İbadetten sonra rızık aramak da ibadettir.',
  },
  {
    type: 'amel',
    title: 'Bugünkü Amel',
    text: 'Kehf Suresi\'nden bir sayfa oku.',
    comment: 'Cuma günü Kehf Suresi okuyan, iki cuma arası nurla aydınlanır.',
  },
  {
    type: 'dua',
    title: 'Cuma Duası',
    text: '"Ya Rabbi! Bugün bizi affet, günahlarımızı bağışla, kalplerimizi nurlandır."',
    comment: 'Cuma günü, af ve mağfiret günüdür.',
  },
  {
    type: 'bilgi',
    title: 'Cuma Bilgisi',
    text: 'Cuma günü gusül almak, güzel koku sürünmek ve temiz elbise giymek sünnettir.',
    comment: 'Temizlik imandandır.',
  },
];

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
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFriday, setIsFriday] = useState(false);
  const [fridayContent, setFridayContent] = useState<typeof FRIDAY_CONTENTS[0] | null>(null);
  const [fridayActionDone, setFridayActionDone] = useState(false);
  const [showFridayModal, setShowFridayModal] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

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

      // Check if today is Friday
      await checkFriday();

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

  // Share message generator
  const getShareMessage = () => {
    if (!verse) return '';
    return `🌙 Bir Ayet Bir Yorum\n\n${verse.text_arabic}\n\n${verse.text_turkish}\n\n📖 ${verse.surah_name_turkish} Suresi - ${verse.ayah_number_in_surah}. Ayet`;
  };

  const getShareMessageShort = () => {
    if (!verse) return '';
    return `${verse.text_turkish}\n\n— ${verse.surah_name_turkish} ${verse.ayah_number_in_surah}`;
  };

  // Check if today is Friday
  const checkFriday = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 5 = Friday
    
    // For testing: set to true always, change back to dayOfWeek === 5 for production
    // Today is Wednesday (3), Friday is (5)
    const isFridayToday = true; // dayOfWeek === 5; // Enable for production
    setIsFriday(isFridayToday);
    
    if (isFridayToday) {
      // Check if user already completed Friday action today
      const lastFridayAction = await AsyncStorage.getItem('lastFridayAction');
      const todayStr = today.toDateString();
      
      if (lastFridayAction !== todayStr) {
        setFridayActionDone(false);
        // Select random Friday content based on week number
        const weekNumber = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
        const contentIndex = weekNumber % FRIDAY_CONTENTS.length;
        setFridayContent(FRIDAY_CONTENTS[contentIndex]);
      } else {
        setFridayActionDone(true);
        const weekNumber = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
        const contentIndex = weekNumber % FRIDAY_CONTENTS.length;
        setFridayContent(FRIDAY_CONTENTS[contentIndex]);
      }
    }
  };

  // Mark Friday action as done
  const completeFridayAction = async () => {
    const today = new Date();
    await AsyncStorage.setItem('lastFridayAction', today.toDateString());
    setFridayActionDone(true);
    setShowFridayModal(false);
  };

  // Open share modal
  const openShareModal = () => {
    setShowShareModal(true);
  };

  // Close share modal
  const closeShareModal = () => {
    setShowShareModal(false);
  };

  // Share to WhatsApp
  const shareToWhatsApp = async () => {
    if (!verse) return;
    const message = encodeURIComponent(getShareMessage());
    const url = `whatsapp://send?text=${message}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to web WhatsApp
        await Linking.openURL(`https://wa.me/?text=${message}`);
      }
      closeShareModal();
      recordShareReading();
    } catch (error) {
      Alert.alert('Hata', 'WhatsApp açılamadı');
    }
  };

  // Share to Telegram
  const shareToTelegram = async () => {
    if (!verse) return;
    const message = encodeURIComponent(getShareMessage());
    const url = `tg://msg?text=${message}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to web Telegram
        await Linking.openURL(`https://t.me/share/url?text=${message}`);
      }
      closeShareModal();
      recordShareReading();
    } catch (error) {
      Alert.alert('Hata', 'Telegram açılamadı');
    }
  };

  // Share to X (Twitter)
  const shareToX = async () => {
    if (!verse) return;
    const message = encodeURIComponent(getShareMessageShort());
    const hashtags = encodeURIComponent('BirAyetBirYorum,Kuran');
    const url = `https://twitter.com/intent/tweet?text=${message}&hashtags=${hashtags}`;
    
    try {
      await Linking.openURL(url);
      closeShareModal();
      recordShareReading();
    } catch (error) {
      Alert.alert('Hata', 'X (Twitter) açılamadı');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!verse) return;
    const message = getShareMessage();
    
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(message);
      } else {
        Clipboard.setString(message);
      }
      Alert.alert('Kopyalandı', 'Ayet panoya kopyalandı');
      closeShareModal();
      recordShareReading();
    } catch (error) {
      Alert.alert('Hata', 'Kopyalama başarısız');
    }
  };

  // Native share (for Notes, Messages, etc.)
  const shareNative = async () => {
    if (!verse) return;
    
    try {
      const message = getShareMessage();
      await Share.share({
        message,
        title: 'Bir Ayet Bir Yorum',
      });
      closeShareModal();
      recordShareReading();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Record reading when shared
  const recordShareReading = async () => {
    if (!verse) return;
    try {
      await fetch(`${backendUrl}/api/reading-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verse_id: verse.verse_number }),
      });
    } catch (error) {
      console.error('Error recording reading:', error);
    }
  };

  const requestNotificationPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('Notifications not available on web platform');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error requesting notification permissions:', err);
      return false;
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
      
      // Check if this verse is favorited
      if (data.verse_number) {
        const favResponse = await fetch(`${backendUrl}/api/favorites/check/${data.verse_number}`);
        const favData = await favResponse.json();
        setIsFavorite(favData.is_favorite);
        
        // Record reading
        await fetch(`${backendUrl}/api/reading-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verse_id: data.verse_number }),
        });
      }
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
            <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>Her gün bir ayet, bir tefekkür.</Text>
          </View>
          <View style={styles.headerButtons}>
            <View style={styles.iconWrapper}>
              <TouchableOpacity
                onPress={() => router.push('/browse')}
                style={[styles.iconButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiIcon}>📖</Text>
              </TouchableOpacity>
              <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Kuran</Text>
            </View>
            
            <View style={styles.iconWrapper}>
              <TouchableOpacity
                onPress={() => router.push('/search')}
                style={[styles.iconButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiIcon}>🔍</Text>
              </TouchableOpacity>
              <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Ara</Text>
            </View>
            
            <View style={styles.iconWrapper}>
              <TouchableOpacity
                onPress={() => router.push('/favorites')}
                style={[styles.iconButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={20} color={colors.surface} />
              </TouchableOpacity>
              <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Favori</Text>
            </View>
            
            <View style={styles.iconWrapper}>
              <TouchableOpacity
                onPress={() => router.push('/statistics')}
                style={[styles.iconButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiIcon}>📊</Text>
              </TouchableOpacity>
              <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>İstatistik</Text>
            </View>
            
            <View style={styles.iconWrapper}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={[styles.iconButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiIcon}>🌙</Text>
              </TouchableOpacity>
              <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Tema</Text>
            </View>
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
                  <Text style={[styles.surahName, { color: colors.primary }]}>
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
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>Ayet (Arapça)</Text>
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
                <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                  Kaynak: Diyanet İşleri Başkanlığı – Kur'an Yolu Tefsiri (esas alınarak hazırlanmıştır).
                </Text>
              </View>

              {/* Ayetle Dua */}
              <View style={[styles.duaSection, { backgroundColor: colors.primary }]}>
                <View style={styles.duaHeader}>
                  <Ionicons name="hand-right" size={20} color="#FFD700" />
                  <Text style={styles.duaTitle}>Ayetle Dua</Text>
                  <Ionicons name="hand-left" size={20} color="#FFD700" />
                </View>
                <Text style={styles.duaText}>
                  "Allah'ım, bu ayetin gereğiyle yaşamayı nasip et."
                </Text>
              </View>

              {/* Spacer */}
              <View style={styles.spacer} />

              {/* Cuma Hatırlatması - Only visible on Fridays */}
              {isFriday && fridayContent && (
                <TouchableOpacity 
                  style={[styles.fridaySection, { 
                    backgroundColor: isDark ? '#1a3a2a' : '#e8f5e9',
                    borderColor: isDark ? '#2e5940' : '#81c784'
                  }]}
                  onPress={() => setShowFridayModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.fridayHeader}>
                    <Text style={styles.fridayEmoji}>🕌</Text>
                    <Text style={[styles.fridayTitle, { color: isDark ? '#81c784' : '#2e7d32' }]}>
                      {fridayContent.title}
                    </Text>
                    {fridayActionDone && (
                      <View style={[styles.fridayBadge, { backgroundColor: '#4caf50' }]}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                  
                  <Text style={[styles.fridayText, { color: isDark ? '#c8e6c9' : '#1b5e20' }]} numberOfLines={2}>
                    {fridayContent.text}
                  </Text>
                  
                  <View style={styles.fridayFooter}>
                    <Text style={[styles.fridayHint, { color: isDark ? '#a5d6a7' : '#388e3c' }]}>
                      {fridayActionDone ? 'Tamamlandı ✓' : 'Detay için dokun →'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Spacer */}
              {isFriday && fridayContent && <View style={styles.spacer} />}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={toggleFavorite}
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? colors.accent : colors.text}
                  />
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>
                    {isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={openShareModal}
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                    Paylaş
                  </Text>
                </TouchableOpacity>
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

        {/* Share Modal */}
        <Modal
          visible={showShareModal}
          transparent={true}
          animationType="slide"
          onRequestClose={closeShareModal}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={closeShareModal}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={[styles.shareModalContent, { backgroundColor: colors.surface }]}
            >
              {/* Modal Header */}
              <View style={[styles.shareModalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.shareModalTitle, { color: colors.text }]}>Paylaş</Text>
                <TouchableOpacity onPress={closeShareModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Share Options */}
              <View style={styles.shareOptionsContainer}>
                {/* WhatsApp */}
                <TouchableOpacity style={styles.shareOption} onPress={shareToWhatsApp}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                    <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.shareOptionText, { color: colors.text }]}>WhatsApp</Text>
                </TouchableOpacity>

                {/* Telegram */}
                <TouchableOpacity style={styles.shareOption} onPress={shareToTelegram}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#0088cc' }]}>
                    <Ionicons name="paper-plane" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.shareOptionText, { color: colors.text }]}>Telegram</Text>
                </TouchableOpacity>

                {/* X (Twitter) */}
                <TouchableOpacity style={styles.shareOption} onPress={shareToX}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#000000' }]}>
                    <Text style={styles.xLogo}>𝕏</Text>
                  </View>
                  <Text style={[styles.shareOptionText, { color: colors.text }]}>X</Text>
                </TouchableOpacity>

                {/* Copy */}
                <TouchableOpacity style={styles.shareOption} onPress={copyToClipboard}>
                  <View style={[styles.shareIconCircle, { backgroundColor: colors.primary }]}>
                    <Ionicons name="copy-outline" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.shareOptionText, { color: colors.text }]}>Kopyala</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={[styles.shareDivider, { backgroundColor: colors.border }]} />

              {/* More Options */}
              <TouchableOpacity 
                style={[styles.moreShareButton, { borderColor: colors.border }]} 
                onPress={shareNative}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                <Text style={[styles.moreShareText, { color: colors.textSecondary }]}>
                  Diğer Uygulamalar
                </Text>
              </TouchableOpacity>

              {/* Preview */}
              <View style={[styles.sharePreview, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.sharePreviewText, { color: colors.textSecondary }]} numberOfLines={3}>
                  {verse ? `${verse.text_turkish.substring(0, 100)}...` : ''}
                </Text>
                <Text style={[styles.sharePreviewSource, { color: colors.primary }]}>
                  {verse ? `${verse.surah_name_turkish} ${verse.ayah_number_in_surah}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Friday Modal */}
        <Modal
          visible={showFridayModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFridayModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowFridayModal(false)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={[styles.fridayModalContent, { 
                backgroundColor: isDark ? '#1a3a2a' : '#f1f8e9'
              }]}
            >
              {fridayContent && (
                <>
                  {/* Modal Header */}
                  <View style={styles.fridayModalHeader}>
                    <Text style={styles.fridayModalEmoji}>🕌</Text>
                    <Text style={[styles.fridayModalTitle, { color: isDark ? '#81c784' : '#2e7d32' }]}>
                      {fridayContent.title}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setShowFridayModal(false)} 
                      style={styles.fridayCloseButton}
                    >
                      <Ionicons name="close" size={24} color={isDark ? '#a5d6a7' : '#388e3c'} />
                    </TouchableOpacity>
                  </View>

                  {/* Arabic text if exists */}
                  {'arabic' in fridayContent && fridayContent.arabic && (
                    <Text style={[styles.fridayModalArabic, { color: isDark ? '#c8e6c9' : '#1b5e20' }]}>
                      {fridayContent.arabic}
                    </Text>
                  )}

                  {/* Main Text */}
                  <Text style={[styles.fridayModalText, { color: isDark ? '#e8f5e9' : '#1b5e20' }]}>
                    {fridayContent.text}
                  </Text>

                  {/* Source if exists */}
                  {'source' in fridayContent && fridayContent.source && (
                    <Text style={[styles.fridayModalSource, { color: isDark ? '#a5d6a7' : '#388e3c' }]}>
                      ({fridayContent.source})
                    </Text>
                  )}

                  {/* Comment */}
                  <View style={[styles.fridayCommentBox, { 
                    backgroundColor: isDark ? '#2e5940' : '#c8e6c9',
                    borderLeftColor: isDark ? '#81c784' : '#4caf50'
                  }]}>
                    <Text style={[styles.fridayCommentText, { color: isDark ? '#e8f5e9' : '#1b5e20' }]}>
                      {fridayContent.comment}
                    </Text>
                  </View>

                  {/* Action Button */}
                  {!fridayActionDone ? (
                    <TouchableOpacity 
                      style={[styles.fridayActionButton, { backgroundColor: '#4caf50' }]}
                      onPress={completeFridayAction}
                    >
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                      <Text style={styles.fridayActionButtonText}>
                        {fridayContent.type === 'dua' ? 'Okudum' : 
                         fridayContent.type === 'amel' ? 'Yaptım' : 
                         fridayContent.type === 'bilgi' ? 'Öğrendim' : 'Okudum'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.fridayCompletedBadge, { backgroundColor: isDark ? '#2e5940' : '#c8e6c9' }]}>
                      <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                      <Text style={[styles.fridayCompletedText, { color: '#4caf50' }]}>
                        Bugün tamamlandı
                      </Text>
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '200',
    letterSpacing: 0.8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    opacity: 0.65,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiIcon: {
    fontSize: 16,
  },
  iconLabel: {
    fontSize: 9,
    fontWeight: '300',
    opacity: 0.7,
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
    fontSize: 26,
    fontWeight: '700',
  },
  surahDetails: {
    fontSize: 12,
    marginBottom: 12,
    opacity: 0.6,
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
    paddingBottom: 8,
  },
  sourceText: {
    fontSize: 10,
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingBottom: 16,
    opacity: 0.6,
  },
  spacer: {
    height: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  duaSection: {
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  duaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  duaText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#F5F5DC',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
  // Share Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '70%',
  },
  shareModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  closeButton: {
    padding: 4,
  },
  shareOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  shareOption: {
    alignItems: 'center',
    gap: 8,
  },
  shareIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  xLogo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareDivider: {
    height: 1,
    marginHorizontal: 20,
  },
  moreShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  moreShareText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sharePreview: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sharePreviewText: {
    fontSize: 13,
    lineHeight: 20,
  },
  sharePreviewSource: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  // Friday Section Styles
  fridaySection: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  fridayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fridayEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  fridayTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    flex: 1,
  },
  fridayBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fridayText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  fridayFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  fridayHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Friday Modal Styles
  fridayModalContent: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '90%',
  },
  fridayModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fridayModalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  fridayModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    flex: 1,
  },
  fridayCloseButton: {
    padding: 4,
  },
  fridayModalArabic: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'serif',
    textAlign: 'right',
    lineHeight: 36,
    marginBottom: 16,
  },
  fridayModalText: {
    fontSize: 17,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    marginBottom: 12,
  },
  fridayModalSource: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  fridayCommentBox: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  fridayCommentText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  fridayActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  fridayActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  fridayCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  fridayCompletedText: {
    fontSize: 14,
    fontWeight: '600',
  },
});