import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationTime, setNotificationTime] = useState({ hour: 0, minute: 0 });
  const [isEnabled, setIsEnabled] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    checkFirstTimeSetup();
  }, []);

  const checkFirstTimeSetup = async () => {
    try {
      // Check if notification time has been set before
      const hasSetTime = await AsyncStorage.getItem('hasSetNotificationTime');
      setIsFirstTime(!hasSetTime);

      if (!hasSetTime) {
        // First time - show time picker (settings page will be shown)
        console.log('First time setup - showing settings');
      } else {
        // Already set - redirect to home
        router.replace('/');
      }

      // Load saved time
      const savedTime = await AsyncStorage.getItem('notificationTime');
      if (savedTime) {
        const time = JSON.parse(savedTime);
        setNotificationTime(time);
      }
    } catch (error) {
      console.error('Error checking first time setup:', error);
    }
  };

  const saveNotificationTime = async (hour: number, minute: number) => {
    try {
      const time = { hour, minute };
      await AsyncStorage.setItem('notificationTime', JSON.stringify(time));
      
      // Mark that notification time has been set
      await AsyncStorage.setItem('hasSetNotificationTime', 'true');
      
      setNotificationTime(time);

      // Reschedule notifications
      if (Platform.OS !== 'web') {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🌙 Günün Ayeti',
            body: 'Bugünün ayetini okumak için uygulamayı açın',
            sound: true,
          },
          trigger: {
            hour: hour,
            minute: minute,
            repeats: true,
          },
        });
      }

      Alert.alert('Başarılı', `Bildirim saati ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} olarak ayarlandı`, [
        {
          text: 'Tamam',
          onPress: () => {
            // If this is first time setup, redirect to home after setting time
            if (isFirstTime) {
              router.replace('/');
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error saving notification time:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilemedi');
    }
  };

  const timeOptions = [
    { hour: 0, minute: 0, label: '00:00 - Gece Yarısı' },
    { hour: 5, minute: 0, label: '05:00 - Sabah' },
    { hour: 6, minute: 0, label: '06:00 - Sabah' },
    { hour: 7, minute: 0, label: '07:00 - Sabah' },
    { hour: 8, minute: 0, label: '08:00 - Sabah' },
    { hour: 12, minute: 0, label: '12:00 - Öğle' },
    { hour: 18, minute: 0, label: '18:00 - Akşam' },
    { hour: 20, minute: 0, label: '20:00 - Akşam' },
    { hour: 21, minute: 0, label: '21:00 - Gece' },
    { hour: 22, minute: 0, label: '22:00 - Gece' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C5F2D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color="#2C5F2D" />
            <Text style={styles.sectionTitle}>Bildirim Saati</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Her gün aynı saatte ayet bildirimi almak için saati seçin
          </Text>

          <View style={styles.timeList}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={`${option.hour}-${option.minute}`}
                style={[
                  styles.timeOption,
                  notificationTime.hour === option.hour &&
                  notificationTime.minute === option.minute &&
                  styles.timeOptionSelected,
                ]}
                onPress={() => saveNotificationTime(option.hour, option.minute)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    notificationTime.hour === option.hour &&
                    notificationTime.minute === option.minute &&
                    styles.timeOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {notificationTime.hour === option.hour &&
                  notificationTime.minute === option.minute && (
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {Platform.OS === 'web' && (
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={24} color="#D4AF37" />
            <Text style={styles.warningText}>
              Bildirimler sadece mobil cihazlarda (iOS/Android) çalışır
            </Text>
          </View>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4C5A9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 20,
    lineHeight: 20,
  },
  timeList: {
    gap: 12,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D4C5A9',
    backgroundColor: '#FFFFFF',
  },
  timeOptionSelected: {
    backgroundColor: '#2C5F2D',
    borderColor: '#2C5F2D',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timeOptionTextSelected: {
    color: '#FFFFFF',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
});
