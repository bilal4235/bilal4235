import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

interface SearchResult {
  verse_number: number;
  surah_number: number;
  surah_name_turkish: string;
  surah_name_arabic: string;
  ayah_number_in_surah: number;
  text_arabic: string;
  text_turkish: string;
  tafsir: string;
}

interface Surah {
  surah_number: number;
  name_turkish: string;
  name_arabic: string;
  verse_count: number;
  revelation_type: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'surahs'>('search');
  const [surahVerses, setSurahVerses] = useState<SearchResult[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

  // Favorileri yükle
  const loadFavorites = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/favorites`);
      const data = await response.json();
      const favIds = new Set<number>(data.favorites?.map((f: any) => f.verse_id) || []);
      setFavorites(favIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Favorilere ekle/çıkar
  const toggleFavorite = async (verseNumber: number) => {
    try {
      const isFav = favorites.has(verseNumber);
      
      if (isFav) {
        // Favorilerden çıkar
        await fetch(`${backendUrl}/api/favorites/${verseNumber}`, {
          method: 'DELETE',
        });
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(verseNumber);
          return newSet;
        });
        Alert.alert('✓', 'Favorilerden çıkarıldı');
      } else {
        // Favorilere ekle
        await fetch(`${backendUrl}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verse_id: verseNumber }),
        });
        setFavorites(prev => new Set(prev).add(verseNumber));
        Alert.alert('✓', 'Favorilere eklendi');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Hata', 'İşlem başarısız oldu');
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (activeTab === 'surahs') {
      loadSurahs();
    }
  }, [activeTab]);

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

  const loadSurahVerses = async (surahNumber: number) => {
    try {
      setLoading(true);
      setSelectedSurah(surahNumber);
      const response = await fetch(`${backendUrl}/api/surah/${surahNumber}`);
      const data = await response.json();
      setSurahVerses(data.verses || []);
    } catch (error) {
      console.error('Error loading surah verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setSearched(true);

      const response = await fetch(`${backendUrl}/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const data = await response.json();

      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C5F2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayet Ara</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons name="search" size={20} color={activeTab === 'search' ? '#FFFFFF' : '#2C5F2D'} />
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>Ara</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'surahs' && styles.tabActive]}
          onPress={() => setActiveTab('surahs')}
        >
          <Ionicons name="book" size={20} color={activeTab === 'surahs' ? '#FFFFFF' : '#2C5F2D'} />
          <Text style={[styles.tabText, activeTab === 'surahs' && styles.tabTextActive]}>Sureler</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'search' ? (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#4A4A4A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Ayet veya sure ara..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setSearchQuery('');
                  setResults([]);
                  setSearched(false);
                }}>
                  <Ionicons name="close-circle" size={20} color="#4A4A4A" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={!searchQuery.trim() || loading}
            >
              <Text style={styles.searchButtonText}>Ara</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.results}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2C5F2D" />
                <Text style={styles.loadingText}>Aranıyor...</Text>
              </View>
            ) : searched && results.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="search-outline" size={64} color="#D4C5A9" />
                <Text style={styles.noResultsText}>Sonuç bulunamadı</Text>
                <Text style={styles.noResultsSubtext}>
                  Farklı bir kelime veya sure adı deneyin
                </Text>
              </View>
            ) : results.length > 0 ? (
              <>
                <Text style={styles.resultCount}>
                  {results.length} sonuç bulundu
                </Text>
                {results.map((verse) => (
                  <View key={verse.verse_number} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <View style={styles.surahInfo}>
                        <Ionicons name="book" size={16} color="#2C5F2D" />
                        <Text style={styles.surahName}>
                          {verse.surah_name_turkish} {verse.ayah_number_in_surah}
                        </Text>
                      </View>
                      <Text style={styles.verseNumber}>#{verse.verse_number}</Text>
                    </View>

                    <View style={styles.verseContent}>
                      <Text style={styles.arabicText}>{verse.text_arabic}</Text>
                      
                      <View style={styles.divider} />
                      
                      <Text style={styles.turkishText}>{verse.text_turkish}</Text>
                    </View>

                    {/* Favorilere Ekle Butonu */}
                    <TouchableOpacity
                      style={[
                        styles.favoriteButton,
                        favorites.has(verse.verse_number) && styles.favoriteButtonActive
                      ]}
                      onPress={() => toggleFavorite(verse.verse_number)}
                    >
                      <Ionicons 
                        name={favorites.has(verse.verse_number) ? "heart" : "heart-outline"} 
                        size={18} 
                        color={favorites.has(verse.verse_number) ? "#FFFFFF" : "#2C5F2D"} 
                      />
                      <Text style={[
                        styles.favoriteButtonText,
                        favorites.has(verse.verse_number) && styles.favoriteButtonTextActive
                      ]}>
                        {favorites.has(verse.verse_number) ? "Favorilerde" : "Favorilere Ekle"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.centerContainer}>
                <Ionicons name="search" size={64} color="#D4C5A9" />
                <Text style={styles.emptyText}>Ayet veya sure aramak için</Text>
                <Text style={styles.emptyText}>yukarıdaki arama kutusunu kullanın</Text>
              </View>
            )}
          </ScrollView>
        </>
      ) : (
        <ScrollView style={styles.results}>
          {selectedSurah ? (
            <>
              <TouchableOpacity
                style={styles.backToList}
                onPress={() => {
                  setSelectedSurah(null);
                  setSurahVerses([]);
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#2C5F2D" />
                <Text style={styles.backToListText}>Surelere Dön</Text>
              </TouchableOpacity>

              {loading ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color="#2C5F2D" />
                </View>
              ) : (
                surahVerses.map((verse) => (
                  <View key={verse.verse_number} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.surahName}>
                        Ayet {verse.ayah_number_in_surah}
                      </Text>
                      <Text style={styles.verseNumber}>#{verse.verse_number}</Text>
                    </View>

                    <View style={styles.verseContent}>
                      <Text style={styles.arabicText}>{verse.text_arabic}</Text>
                      <View style={styles.divider} />
                      <Text style={styles.turkishText}>{verse.text_turkish}</Text>
                    </View>

                    {/* Favorilere Ekle Butonu */}
                    <TouchableOpacity
                      style={[
                        styles.favoriteButton,
                        favorites.has(verse.verse_number) && styles.favoriteButtonActive
                      ]}
                      onPress={() => toggleFavorite(verse.verse_number)}
                    >
                      <Ionicons 
                        name={favorites.has(verse.verse_number) ? "heart" : "heart-outline"} 
                        size={18} 
                        color={favorites.has(verse.verse_number) ? "#FFFFFF" : "#2C5F2D"} 
                      />
                      <Text style={[
                        styles.favoriteButtonText,
                        favorites.has(verse.verse_number) && styles.favoriteButtonTextActive
                      ]}>
                        {favorites.has(verse.verse_number) ? "Favorilerde" : "Favorilere Ekle"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          ) : loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2C5F2D" />
            </View>
          ) : (
            surahs.map((surah) => (
              <TouchableOpacity
                key={surah.surah_number}
                style={styles.surahCard}
                onPress={() => loadSurahVerses(surah.surah_number)}
              >
                <View style={styles.surahNumber}>
                  <Text style={styles.surahNumberText}>{surah.surah_number}</Text>
                </View>
                <View style={styles.surahDetails}>
                  <Text style={styles.surahNameTurkish}>{surah.name_turkish}</Text>
                  <Text style={styles.surahNameArabic}>{surah.name_arabic}</Text>
                  <Text style={styles.surahMeta}>
                    {surah.verse_count} Ayet • {surah.revelation_type === 'Meccan' ? 'Mekki' : 'Medeni'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D4C5A9" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5A9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#F5F5DC',
  },
  tabActive: {
    backgroundColor: '#2C5F2D',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5F2D',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5A9',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5DC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  searchButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2C5F2D',
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
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
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  noResultsSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  resultCount: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5A9',
  },
  surahInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5F2D',
  },
  verseNumber: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  verseContent: {
    gap: 16,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: 'right',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#D4C5A9',
  },
  turkishText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1A1A1A',
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  surahDetails: {
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
  backToList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  backToListText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5F2D',
  },
});