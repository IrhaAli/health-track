import { StyleSheet, View } from "react-native";
import { Avatar, Surface, Text, useTheme } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from "react";
import translations from '@/translations/profile.json';

export default function ProfileHeader() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [t, setT] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Get language first
        const language = await AsyncStorage.getItem('userLanguage');
        const effectiveLanguage = language || 'en';
        setCurrentLanguage(effectiveLanguage);
        setT(translations[effectiveLanguage as keyof typeof translations]);

        // Then get user data
        const name = await AsyncStorage.getItem('userName');
        const email = await AsyncStorage.getItem('userEmail');
        setUserName(name);
        setUserEmail(email);
      } catch (error) {
        console.error('Error initializing:', error);
        // Fallback to English if there's an error
        setCurrentLanguage('en');
        setT(translations.en);
      }
    };

    initialize();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const languageListener = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language && language !== currentLanguage) {
          setCurrentLanguage(language);
          setT(translations[language as keyof typeof translations]);
        }
      } catch (error) {
        console.error('Error getting language:', error);
      }
    };

    const interval = setInterval(languageListener, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage]);

  if (!t) return null; // Don't render until translations are loaded

  const displayName = userName || userEmail || t.guest;

  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.content}>
        <Avatar.Image
          source={{
            uri: "https://tr.rbxcdn.com/63dc4f38b22fabffccefa6363a33dd06/420/420/Hat/Webp",
          }}
          size={80}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.greeting}>
            {t.greeting} {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
          </Text>
          {userName && userEmail && (
            <Text variant="bodyMedium" style={styles.email}>
              {userEmail.toLowerCase()}
            </Text>
          )}
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    width: "100%",
    marginTop: 25
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  greeting: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 20
  },
  email: {
    opacity: 0.7,
  }
});
