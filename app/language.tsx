import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Dimensions } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const LanguageSelection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  React.useEffect(() => {
    const checkLanguage = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking language:', error);
      }
    };
    checkLanguage();
  }, []);

  const handleLanguageSelect = async (language: string) => {
    try {
      setLoading(true);
      setSelectedLanguage(language);
      await AsyncStorage.setItem('userLanguage', language);
      router.push('/login');
    } catch (error) {
      console.error('Error saving language:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Surface style={styles.formContainer} elevation={4}>
            <Text
              variant="displaySmall"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              Welcome!
            </Text>
            
            <Text variant="headlineSmall" style={styles.subtitle}>
              Choose Your Language
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => handleLanguageSelect('en')}
                style={[
                  styles.languageButton,
                  selectedLanguage === 'en' && styles.selectedButton
                ]}
                contentStyle={styles.buttonContent}
                loading={loading && selectedLanguage === 'en'}
                disabled={loading}
                labelStyle={styles.buttonLabel}
              >
                English
              </Button>

              <Button
                mode="contained"
                onPress={() => handleLanguageSelect('fr')}
                style={[
                  styles.languageButton,
                  selectedLanguage === 'fr' && styles.selectedButton
                ]}
                contentStyle={styles.buttonContent}
                loading={loading && selectedLanguage === 'fr'}
                disabled={loading}
                labelStyle={styles.buttonLabel}
              >
                Français
              </Button>

              <Button
                mode="contained"
                onPress={() => handleLanguageSelect('ar')}
                style={[
                  styles.languageButton,
                  selectedLanguage === 'ar' && styles.selectedButton
                ]}
                contentStyle={styles.buttonContent}
                loading={loading && selectedLanguage === 'ar'}
                disabled={loading}
                labelStyle={styles.buttonLabel}
              >
                العربية
              </Button>
            </View>
          </Surface>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 32,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 32,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 16,
  },
  languageButton: {
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  selectedButton: {
    transform: [{scale: 1.02}],
    elevation: 4,
  }
});

export default LanguageSelection;
