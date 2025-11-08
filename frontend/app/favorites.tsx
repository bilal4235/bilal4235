import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    loadTheme();
    fetchFavorites();
  }, []);

  const loadTheme = async () => {
    const theme = await AsyncStorage.getItem('theme');
    setIsDark(theme === 'dark');
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/favorites`);
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Hata', 'Favoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (verseId: number) => {
    try {
      await fetch(`${backendUrl}/api/favorites/${verseId}`, {
        method: 'DELETE',
      });
      // Remove from local state
      setFavorites(favorites.filter(v => v.verse_number !== verseId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Hata', 'Favorilerden çıkarılırken hata oluştu');
    }
  };

  const colors = isDark ? {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    primary: '#4A7C4E',
    text: '#F5F5DC',
    textSecondary: '#C0C0A0',
    border: '#3A3A3A',
    accent: '#FFD700',
  } : {
    background: '#F5F5DC',
    surface: '#FFFFFF',
    primary: '#2C5F2D',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    border: '#D4C5A9',
    accent: '#D4AF37',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favorilerim</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Yükleniyor...
          </Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Henüz favori ayetiniz yok
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Beğendiğiniz ayetleri favorilere ekleyin
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {favorites.map((verse) => (
            <View
              key={verse.verse_number}
              style={[styles.verseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {/* Surah Info */}
              <View style={styles.verseHeader}>
                <View>
                  <Text style={[styles.surahName, { color: colors.primary }]}>
                    {verse.surah_name_turkish}
                  </Text>
                  <Text style={[styles.ayahNumber, { color: colors.textSecondary }]}>
                    {verse.surah_number}. Sure • {verse.ayah_number_in_surah}. Ayet
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeFavorite(verse.verse_number)}
                  style={styles.favoriteButton}
                >
                  <Ionicons name="heart" size={24} color={colors.accent} />
                </TouchableOpacity>
              </View>

              {/* Arabic Text */}
              <Text style={[styles.arabicText, { color: colors.text }]}>
                {verse.text_arabic}
              </Text>

              {/* Turkish Translation */}
              <Text style={[styles.turkishText, { color: colors.text }]}>
                {verse.text_turkish}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyText: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  verseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  surahName: {
    fontSize: 18,
    fontWeight: '700',
  },
  ayahNumber: {
    fontSize: 12,
    marginTop: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    marginBottom: 12,
  },
  turkishText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
