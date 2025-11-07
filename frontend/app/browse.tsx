import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

interface Surah {
  surah_number: number;
  name_turkish: string;
  name_arabic: string;
  verse_count: number;
  revelation_type: string;
}

interface Verse {
  verse_number: number;
  surah_number: number;
  surah_name_turkish: string;
  surah_name_arabic: string;
  ayah_number_in_surah: number;
  text_arabic: string;
  text_turkish: string;
  tafsir: string;
}

export default function BrowseScreen() {
  const router = useRouter();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'surahs' | 'verses' | 'verse'>('surahs');

  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/surahs`);
      const data = await response.json();
      setSurahs(data.surahs || []);
    } catch (error) {
      console.error('Error loading surahs:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSurah = async (surah: Surah) => {
    try {
      setLoading(true);
      setSelectedSurah(surah);
      setView('verses');
      
      const response = await fetch(`${backendUrl}/api/surah/${surah.surah_number}`);
      const data = await response.json();
      setVerses(data.verses || []);
    } catch (error) {
      console.error('Error loading verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectVerse = (verse: Verse) => {
    setSelectedVerse(verse);
    setView('verse');
  };

  const goBack = () => {
    if (view === 'verse') {
      setView('verses');
      setSelectedVerse(null);
    } else if (view === 'verses') {
      setView('surahs');
      setSelectedSurah(null);
      setVerses([]);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C5F2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {view === 'surahs' ? 'Sureler' : view === 'verses' ? selectedSurah?.name_turkish : 'Ayet Detayı'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading && view !== 'verse' ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2C5F2D" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : view === 'surahs' ? (
          // Surah List
          <View style={styles.surahList}>
            {surahs.map((surah) => (
              <TouchableOpacity
                key={surah.surah_number}
                style={styles.surahCard}
                onPress={() => selectSurah(surah)}
              >
                <View style={styles.surahNumber}>
                  <Text style={styles.surahNumberText}>{surah.surah_number}</Text>
                </View>
                <View style={styles.surahInfo}>
                  <Text style={styles.surahNameTurkish}>{surah.name_turkish}</Text>
                  <Text style={styles.surahNameArabic}>{surah.name_arabic}</Text>
                  <Text style={styles.surahMeta}>
                    {surah.verse_count} Ayet • {surah.revelation_type === 'Meccan' ? 'Mekki' : 'Medeni'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D4C5A9" />
              </TouchableOpacity>
            ))}
          </View>
        ) : view === 'verses' ? (
          // Verse List
          <View style={styles.verseList}>
            <View style={styles.surahHeader}>
              <Text style={styles.surahHeaderTitle}>{selectedSurah?.name_turkish}</Text>
              <Text style={styles.surahHeaderArabic}>{selectedSurah?.name_arabic}</Text>
              <Text style={styles.surahHeaderMeta}>
                {selectedSurah?.verse_count} Ayet • {selectedSurah?.revelation_type === 'Meccan' ? 'Mekki' : 'Medeni'}
              </Text>
            </View>

            {verses.map((verse) => (
              <TouchableOpacity
                key={verse.verse_number}
                style={styles.verseCard}
                onPress={() => selectVerse(verse)}
              >
                <View style={styles.verseHeader}>
                  <View style={styles.verseNumberBadge}>
                    <Text style={styles.verseNumberBadgeText}>{verse.ayah_number_in_surah}</Text>
                  </View>
                  <View style={styles.versePreview}>
                    <Text style={styles.versePreviewArabic} numberOfLines={1}>
                      {verse.text_arabic}
                    </Text>
                    <Text style={styles.versePreviewTurkish} numberOfLines={2}>
                      {verse.text_turkish}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#D4C5A9" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          // Single Verse View
          selectedVerse && (
            <View style={styles.singleVerseContainer}>
              {/* Verse Info */}
              <View style={styles.verseInfoCard}>
                <View style={styles.verseInfoHeader}>
                  <Ionicons name="star" size={20} color="#D4AF37" />
                  <Text style={styles.verseInfoTitle}>
                    {selectedVerse.surah_name_turkish} - Ayet {selectedVerse.ayah_number_in_surah}
                  </Text>
                </View>
                <Text style={styles.verseInfoMeta}>
                  {selectedVerse.surah_number}. Sure • {selectedVerse.ayah_number_in_surah}. Ayet
                </Text>
              </View>

              {/* Arabic Text */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="book-outline" size={18} color="#2C5F2D" />
                  <Text style={styles.sectionTitle}>Arapça Metin</Text>
                </View>
                <Text style={styles.arabicText}>{selectedVerse.text_arabic}</Text>
              </View>

              <View style={styles.spacer} />

              {/* Turkish Translation */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="language" size={18} color="#2C5F2D" />
                  <Text style={styles.sectionTitle}>Türkçe Meal (Diyanet)</Text>
                </View>
                <Text style={styles.turkishText}>{selectedVerse.text_turkish}</Text>
              </View>

              <View style={styles.spacer} />

              {/* Tafsir */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb-outline" size={18} color="#D4AF37" />
                  <Text style={styles.sectionTitle}>Tefsir ve Yorum</Text>
                </View>
                <Text style={styles.tafsirText}>{selectedVerse.tafsir}</Text>
              </View>

              {/* Navigation Buttons */}
              <View style={styles.navigationButtons}>
                {selectedVerse.ayah_number_in_surah > 1 && (
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => {
                      const prevVerse = verses.find(
                        v => v.ayah_number_in_surah === selectedVerse.ayah_number_in_surah - 1
                      );
                      if (prevVerse) selectVerse(prevVerse);
                    }}
                  >
                    <Ionicons name="chevron-back" size={24} color="#2C5F2D" />
                    <Text style={styles.navButtonText}>Önceki Ayet</Text>
                  </TouchableOpacity>
                )}

                {selectedVerse.ayah_number_in_surah < verses.length && (
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => {
                      const nextVerse = verses.find(
                        v => v.ayah_number_in_surah === selectedVerse.ayah_number_in_surah + 1
                      );
                      if (nextVerse) selectVerse(nextVerse);
                    }}
                  >
                    <Text style={styles.navButtonText}>Sonraki Ayet</Text>
                    <Ionicons name="chevron-forward" size={24} color="#2C5F2D" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        )}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5A9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A4A4A',
  },
  surahList: {
    gap: 12,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  surahNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2C5F2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  surahInfo: {
    flex: 1,
  },
  surahNameTurkish: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  surahNameArabic: {
    fontSize: 16,
    color: '#2C5F2D',
    marginBottom: 4,
  },
  surahMeta: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  verseList: {
    gap: 12,
  },
  surahHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  surahHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  surahHeaderArabic: {
    fontSize: 20,
    color: '#2C5F2D',
    marginBottom: 8,
  },
  surahHeaderMeta: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  verseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verseNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C5F2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  versePreview: {
    flex: 1,
  },
  versePreviewArabic: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'right',
  },
  versePreviewTurkish: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  singleVerseContainer: {
    gap: 0,
  },
  verseInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  verseInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  verseInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  verseInfoMeta: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4C5A9',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5A9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5F2D',
  },
  arabicText: {
    fontSize: 28,
    lineHeight: 48,
    textAlign: 'right',
    padding: 20,
    color: '#1A1A1A',
  },
  turkishText: {
    fontSize: 18,
    lineHeight: 30,
    padding: 20,
    color: '#1A1A1A',
  },
  tafsirText: {
    fontSize: 16,
    lineHeight: 26,
    padding: 20,
    color: '#1A1A1A',
  },
  spacer: {
    height: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C5F2D',
    flex: 1,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5F2D',
  },
});
