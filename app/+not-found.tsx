import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import React from 'react';
import { Surface, Text, Button, Icon } from 'react-native-paper';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Surface style={styles.container} elevation={0}>
        <Icon source="alert-circle-outline" size={64} color="tomato" />
        <Text variant="headlineMedium" style={styles.title}>
          This screen doesn't exist.
        </Text>
        <Button
          mode="contained"
          onPress={() => {}}
          ref="/"
          icon="home"
          style={styles.button}
          contentStyle={styles.buttonContent}>
          Go to home screen!
        </Button>
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginVertical: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  }
});
