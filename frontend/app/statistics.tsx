import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StatisticsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const backendUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    loadTheme();
    fetchStatistics();
  }, []);

  const loadTheme = async () => {
    const theme = await AsyncStorage.getItem('theme');
    setIsDark(theme === 'dark');
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>İstatistikler</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Yükleniyor...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Streak Card */}
          <View style={[styles.streakCard, { backgroundColor: colors.primary }]}>
            <Ionicons name="flame" size={48} color="#FFD700" />
            <Text style={styles.streakNumber}>{stats?.reading_streak || 0}</Text>
            <Text style={styles.streakLabel}>Gün Üst Üste</Text>
            <Text style={styles.streakSubtext}>Okuma serisi devam ediyor! 🎉</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Total Read */}
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="book" size={32} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {stats?.total_verses_read || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Toplam Okunan
              </Text>
            </View>

            {/* This Month */}
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="calendar" size={32} color={colors.accent} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {stats?.verses_this_month || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Bu Ay
              </Text>
            </View>
          </View>

          {/* Top Surahs */}
          <View style={[styles.topSurahsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                En Çok Okunan Sureler
              </Text>
            </View>

            {stats?.top_surahs && stats.top_surahs.length > 0 ? (
              stats.top_surahs.map((surah: any, index: number) => (
                <View
                  key={surah.surah_number}
                  style={[
                    styles.surahItem,
                    index < stats.top_surahs.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.surahRank}>
                    <Text style={[styles.rankNumber, { color: colors.accent }]}>
                      #{index + 1}
                    </Text>
                  </View>
                  <View style={styles.surahInfo}>
                    <Text style={[styles.surahName, { color: colors.text }]}>
                      {surah.surah_name}
                    </Text>
                    <Text style={[styles.readCount, { color: colors.textSecondary }]}>
                      {surah.read_count} ayet okundu
                    </Text>
                  </View>
                  <Ionicons name="book-outline" size={20} color={colors.primary} />
                </View>
              ))
            ) : (
              <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                Henüz okuma geçmişiniz yok
              </Text>
            )}
          </View>

          {/* Motivational Message */}
          <View style={[styles.motivationCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
            <Ionicons name="sparkles" size={24} color={colors.accent} />
            <Text style={[styles.motivationText, { color: colors.text }]}>
              {stats?.total_verses_read === 0
                ? "Kuran okumaya başlayın! Her ayet bir hidayettir."
                : stats?.reading_streak > 7
                ? "Harika! Okuma serisiniz devam ediyor 🔥"
                : stats?.reading_streak > 0
                ? "Devam edin! Güzel bir seri oluşturdunuz."
                : "Bugün de bir ayet okuyun!"
              }
            </Text>
          </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  streakCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#F5F5DC',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  topSurahsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  surahRank: {
    width: 40,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
  },
  readCount: {
    fontSize: 12,
    marginTop: 2,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 16,
  },
  motivationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 12,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
