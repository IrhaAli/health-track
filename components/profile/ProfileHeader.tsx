import { StyleSheet, View } from "react-native";
import { Avatar, Surface, Text, useTheme } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from "react";
import i18n from '@/i18n';

export default function ProfileHeader() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const initialize = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        const email = await AsyncStorage.getItem('userEmail');
        setUserName(name);
        setUserEmail(email);
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };

    initialize();
  }, []);

  const displayName = userName || userEmail || i18n.t('guest');

  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.row}>
        <Avatar.Image
          source={{
            uri: "https://tr.rbxcdn.com/63dc4f38b22fabffccefa6363a33dd06/420/420/Hat/Webp",
          }}
          size={60}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.greeting}>
            {i18n.t('greeting')} {displayName ? displayName.charAt(0).toUpperCase() + displayName.slice(1) : ''}
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
  row: {
    flexDirection: 'row'
  },
  avatar: {
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 16
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
