import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { Button, Surface, TextInput, Text, useTheme } from "react-native-paper";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { getAuth } from "firebase/auth";
import React from "react";
import { Alert } from "react-native";

export default function ProfileContactForm() {
  const auth = getAuth();
  const theme = useTheme();

  const [contactUs, setContactUs] = useState({
    subject: "",
    text: "",
  });

  const onContactSend = async () => {
    if (!contactUs.subject || !contactUs.text) {
      // Using Snackbar would be better but keeping Alert for now
      Alert.alert("Please fill the form before submitting.");
    } else {
      await addDoc(collection(db, "contacts"), {
        user_id: auth.currentUser?.uid,
        ...contactUs,
        date: new Date(),
      });
      setContactUs({ subject: "", text: "" });
    }
  };

  return (
    <Surface style={styles.container} elevation={1}>
      <Text variant="titleLarge" style={styles.title}>Contact Us</Text>
      
      <TextInput
        mode="outlined"
        label="Subject"
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
        label="Message"
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
        Send Message
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
