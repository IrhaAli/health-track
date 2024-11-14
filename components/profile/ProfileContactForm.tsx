import { StyleSheet, View } from "react-native";
import { useState, useEffect } from "react";
import { Button, Surface, TextInput, Text, useTheme } from "react-native-paper";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import React from "react";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/services/i18n';

export default function ProfileContactForm() {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [contactUs, setContactUs] = useState({
    subject: "",
    text: "",
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const userString = await AsyncStorage.getItem('session');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };

    initialize();
  }, []);

  const onContactSend = async () => {
    if (!contactUs.subject || !contactUs.text) {
      Alert.alert(i18n.t('fillFormError'));
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
      <Text variant="titleLarge" style={styles.title}>
        {i18n.t('title')}
      </Text>
      
      <TextInput
        mode="outlined"
        label={i18n.t('subject')}
        value={contactUs.subject}
        onChangeText={(item: string) => {
          setContactUs((prev) => ({ ...prev, subject: item }));
        }}
        autoCorrect={false}
        autoCapitalize="words"
        style={styles.subjectInput}
        outlineColor={theme.colors.primary}
        activeOutlineColor={theme.colors.primary}
        textAlignVertical="center"
        textContentType="none"
      />

      <TextInput
        mode="outlined"
        label={i18n.t('message')}
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
        {i18n.t('sendMessage')}
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
