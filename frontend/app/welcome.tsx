import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = async () => {
    try {
      // İlk açılışın tamamlandığını kaydet
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      // Ana ekrana yönlendir
      router.replace('/');
    } catch (error) {
      console.error('Error saving welcome status:', error);
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C5F2D" />
      
      {/* Üst kısım - Cami silueti teması */}
      <View style={styles.topSection}>
        <View style={styles.moonContainer}>
          <Ionicons name="moon" size={40} color="#FFD700" />
        </View>
        
        {/* Cami ikonu */}
        <View style={styles.mosqueContainer}>
          <Ionicons name="moon" size={120} color="#F5F5DC" opacity={0.3} style={styles.backgroundMoon} />
          <View style={styles.mosqueIcon}>
            <View style={styles.dome}>
              <View style={styles.crescent}>
                <Ionicons name="moon" size={24} color="#FFD700" />
              </View>
            </View>
            <View style={styles.mosqueBase}>
              <View style={styles.minaret}>
                <View style={styles.minaretTop} />
                <View style={styles.minaretBody} />
              </View>
              <View style={styles.mainBuilding}>
                <View style={styles.door} />
              </View>
              <View style={styles.minaret}>
                <View style={styles.minaretTop} />
                <View style={styles.minaretBody} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Alt kısım - İçerik */}
      <View style={styles.bottomSection}>
        <Text style={styles.appName}>Bir Ayet Bir Yorum</Text>
        <Text style={styles.subtitle}>Her gün bir ayet, bir yorum</Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="book" size={24} color="#2C5F2D" />
            <Text style={styles.featureText}>Günlük Ayetler</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="search" size={24} color="#2C5F2D" />
            <Text style={styles.featureText}>Arama & Keşfet</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="notifications" size={24} color="#2C5F2D" />
            <Text style={styles.featureText}>Günlük Hatırlatma</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Başla</Text>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Diyanet İşleri Başkanlığı resmi kaynağı
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#2C5F2D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  moonContainer: {
    position: 'absolute',
    top: 60,
    right: 40,
  },
  mosqueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundMoon: {
    position: 'absolute',
    top: -60,
    opacity: 0.1,
  },
  mosqueIcon: {
    alignItems: 'center',
  },
  dome: {
    width: 100,
    height: 50,
    backgroundColor: '#F5F5DC',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  crescent: {
    marginTop: -12,
  },
  mosqueBase: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  minaret: {
    alignItems: 'center',
  },
  minaretTop: {
    width: 12,
    height: 12,
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  minaretBody: {
    width: 16,
    height: 60,
    backgroundColor: '#F5F5DC',
    borderRadius: 2,
  },
  mainBuilding: {
    width: 80,
    height: 70,
    backgroundColor: '#F5F5DC',
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  door: {
    width: 20,
    height: 30,
    backgroundColor: '#2C5F2D',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C5F2D',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2C5F2D',
  },
  featureText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#2C5F2D',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 12,
    color: '#4A4A4A',
    textAlign: 'center',
  },
});
