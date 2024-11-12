import { StyleSheet, View } from "react-native";
import { useState, useEffect } from "react";
import { Button, Surface, TextInput, Text, useTheme } from "react-native-paper";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import React from "react";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/profile.json';

export default function ProfileContactForm() {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [t, setT] = useState<any>(null);

  // Initialize user and language
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get language first
        const language = await AsyncStorage.getItem('userLanguage');
        const effectiveLanguage = language || 'en';
        setCurrentLanguage(effectiveLanguage);
        setT(translations[effectiveLanguage as keyof typeof translations]);

        // Then get user
        const userString = await AsyncStorage.getItem('session');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        }
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

    // Set up event listener for AsyncStorage changes
    const interval = setInterval(languageListener, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage]);

  const [contactUs, setContactUs] = useState({
    subject: "",
    text: "",
  });

  const onContactSend = async () => {
    if (!t) return; // Wait for translations to load

    if (!contactUs.subject || !contactUs.text) {
      Alert.alert(t.fillFormError);
    } else {
      await addDoc(collection(db, "contacts"), {
        user_id: currentUser?.uid,
        ...contactUs,
        date: new Date(),
      });
      setContactUs({ subject: "", text: "" });
    }
  };

  if (!t) return null; // Don't render until translations are loaded

  return (
    <Surface style={styles.container} elevation={1}>
      <Text variant="titleLarge" style={[
        styles.title,
        currentLanguage === 'ar' && styles.titleRTL
      ]}>{t.title}</Text>
      
      <TextInput
        mode="outlined"
        label={t.subject}
        value={contactUs.subject}
        onChangeText={(item: string) => {
          setContactUs((prev) => ({ ...prev, subject: item }));
        }}
        autoCorrect={false}
        autoCapitalize="words"
        style={[
          styles.subjectInput,
          currentLanguage === 'ar' && styles.inputRTL
        ]}
        outlineColor={theme.colors.primary}
        activeOutlineColor={theme.colors.primary}
        textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
        textAlignVertical="center"
        textContentType="none"
        contentStyle={[
          currentLanguage === 'ar' && styles.inputContentRTL
        ]}
      />

      <TextInput
        mode="outlined"
        label={t.message}
        multiline
        numberOfLines={5}
        value={contactUs.text}
        onChangeText={(item: string) => {
          setContactUs((prev) => ({ ...prev, text: item }));
        }}
        autoCorrect={false}
        autoCapitalize="sentences"
        style={[
          styles.messageInput,
          currentLanguage === 'ar' && styles.inputRTL
        ]}
        outlineColor={theme.colors.primary}
        activeOutlineColor={theme.colors.primary}
        textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
        contentStyle={[
          currentLanguage === 'ar' && styles.inputContentRTL
        ]}
      />

      <Button 
        mode="contained"
        onPress={onContactSend}
        style={styles.button}
        icon="send"
        contentStyle={currentLanguage === 'ar' && {flexDirection: 'row-reverse'}}
      >
        {t.sendMessage}
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  titleRTL: {
    textAlign: 'right',
    width: '100%'
  },
  subjectInput: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  messageInput: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 6,
  },
  inputRTL: {
    textAlign: 'right',
  },
  inputContentRTL: {
    textAlign: 'right',
    writingDirection: 'rtl'
  }
});
