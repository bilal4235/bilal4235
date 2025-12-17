import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function Layout() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const seen = await AsyncStorage.getItem('hasSeenWelcome');
      
      if (!seen) {
        // İlk açılış - splash'i 3 saniye göster
        setTimeout(async () => {
          await AsyncStorage.setItem('hasSeenWelcome', 'true');
          setShowSplash(false);
          setHasSeenWelcome(false);
        }, 3000);
      } else {
        // Daha önce açılmış - splash'i kısa göster
        setTimeout(() => {
          setShowSplash(false);
          setHasSeenWelcome(true);
        }, 1500);
      }
    } catch (err) {
      console.error('Error checking first launch:', err);
      setTimeout(() => setShowSplash(false), 1500);
    }
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/splash-welcome.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="browse" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="statistics" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#2C5F2D',
  },
  splashImage: {
    width: width,
    height: height,
  },
});
