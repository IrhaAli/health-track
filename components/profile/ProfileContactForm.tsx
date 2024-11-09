import { StyleSheet, View } from "react-native";
import { useState, useEffect } from "react";
import { Button, Surface, TextInput, Text, useTheme } from "react-native-paper";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import React from "react";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/profile.json';

export default function ProfileContactForm() {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    const getUser = async () => {
      const userString = await AsyncStorage.getItem('session');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user);
      }
    };
    getUser();

    const getLanguage = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language) {
          setCurrentLanguage(language);
          setT(translations[language as keyof typeof translations]);
        }
      } catch (error) {
        console.error('Error getting language:', error);
      }
    };
    getLanguage();
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

  return (
    <Surface style={styles.container} elevation={1}>
      <Text variant="titleLarge" style={styles.title}>{t.title}</Text>
      
      <TextInput
        mode="outlined"
        label={t.subject}
        value={contactUs.subject}
        onChangeText={(item: string) => {
          setContactUs((prev) => ({ ...prev, subject: item }));
        }}
        autoCorrect={false}
        autoCapitalize="words"
        style={styles.subjectInput}
        outlineColor={theme.colors.primary}
        activeOutlineColor={theme.colors.primary}
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
        style={styles.messageInput}
        outlineColor={theme.colors.primary}
        activeOutlineColor={theme.colors.primary}
      />

      <Button 
        mode="contained"
        onPress={onContactSend}
        style={styles.button}
        icon="send"
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
  }
});
