import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SafeAreaView, StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Alert, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import "../services/firebaseConfig";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Button, TextInput, Text, Surface, useTheme, HelperText, Dialog, Portal } from "react-native-paper";
import { useDispatch } from "react-redux";
import { setUser, setUserId } from "@/store/userSlice";
import { useSession } from "@/ctx";
import { AppDispatch } from "@/store/store";
import i18n from "@/services/i18n";
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { Colors } from "@/app/theme";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { signIn } = useSession();
  const auth = getAuth();
  const theme = useTheme();

  const handleLanguageSelect = useCallback(async (language: string) => {
    try {
      // Update i18n locale and save to AsyncStorage
      i18n.locale = language;
      await AsyncStorage.setItem('userLanguage', language);

      // Handle RTL layout for Arabic
      const isRTL = language === 'ar';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      }

      setLanguageDialogVisible(false);
      
      // Always reload app after language change
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  const onSubmit = useCallback(() => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    setEmailError("");
    setPasswordError("");

    if (email.length === 0) {
      setEmailError(i18n.t('emailEmpty'));
      return;
    } else if (reg.test(email) === false) {
      setEmailError(i18n.t('emailInvalid'));
      return;
    } else if (password.length === 0) {
      setPasswordError(i18n.t('passwordEmpty'));
      return;
    }

    setLoading(true);

    signIn(email, password)
      .then((user: any) => {
        dispatch(setUser(JSON.stringify(user)));
        dispatch(setUserId(user.uid));
        router.push("/(root)");
        setLoading(false);
      })
      .catch((error: any) => {
        console.log("error", error);
        if (error.code === "auth/invalid-email") {
          setEmailError(error.message);
        } else if (error.code === "auth/user-not-found") {
          setEmailError(i18n.t('emailNotFound'));
        } else if (error.code === "auth/wrong-password") {
          setPasswordError(i18n.t('passwordInvalid'));
        } else {
          setEmailError(error.message);
        }
        setLoading(false);
      });
  }, [email, password, signIn, dispatch]);

  const onTestUser = useCallback(() => {
    setEmail("test@test.com");
    setPassword("test1234");
    setLoading(true);

    signIn("test@test.com", "test1234")
      .then((user: any) => {
        dispatch(setUser(JSON.stringify(user)));
        dispatch(setUserId(user.uid));
        router.push("/(root)");
        setLoading(false);
      })
      .catch((error: any) => {
        setEmailError(error.message);
        setLoading(false);
      });
  }, [signIn, dispatch]);

  const clearAllSessions = useCallback(async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('userLanguage');
      dispatch(setUser(null));
      dispatch(setUserId(null));
      Alert.alert('Success', 'All sessions cleared successfully', [
        {
          text: 'OK',
          onPress: async () => {
            await Updates.reloadAsync();
          }
        }
      ]);
    } catch (error) {
      console.error('Error clearing sessions:', error);
      Alert.alert('Error', 'Failed to clear sessions');
    }
  }, [auth, dispatch]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailError("");
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setPasswordError("");
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setPasswordHidden(prev => !prev);
  }, []);

  const toggleLanguageDialog = useCallback(() => {
    setLanguageDialogVisible(prev => !prev);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContainer}>
            <Surface style={styles.formContainer} elevation={2}>
              <Text
                variant="displaySmall"
                style={[styles.title, { color: theme.colors.primary }]}
              >
                Health App
              </Text>

              <View style={styles.inputView}>
                <TextInput
                  mode="outlined"
                  label={i18n.t('email')}
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCorrect={false}
                  placeholder={i18n.t('emailPlaceholder')}
                  editable={!loading}
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                  error={!!emailError}
                />
                {emailError ? (
                  <HelperText type="error" visible={!!emailError}>
                    {emailError}
                  </HelperText>
                ) : null}
              </View>

              <View style={styles.inputView}>
                <TextInput
                  mode="outlined"
                  label={i18n.t('password')}
                  placeholder={i18n.t('passwordPlaceholder')}
                  value={password}
                  onChangeText={handlePasswordChange}
                  autoCorrect={false}
                  autoCapitalize="none"
                  secureTextEntry={isPasswordHidden}
                  editable={!loading}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={isPasswordHidden ? "eye-off" : "eye"}
                      onPress={togglePasswordVisibility}
                    />
                  }
                  error={!!passwordError}
                />
                {passwordError ? (
                  <HelperText type="error" visible={!!passwordError}>
                    {passwordError}
                  </HelperText>
                ) : null}
              </View>

              <Button
                loading={loading}
                mode="contained"
                disabled={loading}
                onPress={onSubmit}
                style={styles.button}
                labelStyle={{ fontSize: 16 }}
                contentStyle={styles.buttonContent}
              >
                {i18n.t('signIn')}
              </Button>

              <Link href="/forgot_password" style={{ alignSelf: 'center' }}>
                <Button
                  mode="text"
                  style={styles.forgotPassword}
                  labelStyle={{ fontSize: 16 }}
                >{i18n.t('forgotPassword')}</Button>
              </Link>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text variant="bodySmall" style={styles.orText}>
                  {i18n.t('or')}
                </Text>
                <View style={styles.line} />
              </View>

              <View style={styles.signUpText}>
                <Text variant="bodyMedium">{i18n.t('noAccount')}</Text>
              </View>

              <Link href="/register" asChild>
                <Button
                  mode="contained"
                  style={styles.buttonSignUp}
                  labelStyle={{ fontSize: 16 }}
                  contentStyle={styles.buttonContentSignUp}
                >
                  {i18n.t('signUpNow')}
                </Button>
              </Link>

              <Button
                mode="text"
                style={styles.languageButton}
                labelStyle={{ fontSize: 16 }}
                icon="translate"
                onPress={toggleLanguageDialog}
              >
                {i18n.t('changeLanguage')}
              </Button>

              <Portal>
                <Dialog visible={languageDialogVisible} onDismiss={toggleLanguageDialog}>
                  <Dialog.Title style={styles.dialogTitle}>{i18n.t('selectLanguage')}</Dialog.Title>
                  <Dialog.Content style={styles.dialogContent}>
                    <Button
                      mode="contained-tonal"
                      onPress={() => handleLanguageSelect('en')}
                      style={[styles.dialogButton, i18n.locale === 'en' && styles.selectedLanguage]}
                      labelStyle={[styles.dialogButtonLabel, i18n.locale === 'en' && styles.selectedLanguageLabel]}
                      icon="check-circle"
                    >
                      English
                    </Button>
                    <Button
                      mode="contained-tonal"
                      onPress={() => handleLanguageSelect('fr')}
                      style={[styles.dialogButton, i18n.locale === 'fr' && styles.selectedLanguage]}
                      labelStyle={[styles.dialogButtonLabel, i18n.locale === 'fr' && styles.selectedLanguageLabel]}
                      icon="check-circle"
                    >
                      Français
                    </Button>
                    {/* <Button
                      mode="contained-tonal"
                      onPress={() => handleLanguageSelect('ar')}
                      style={[styles.dialogButton, i18n.locale === 'ar' && styles.selectedLanguage]}
                      labelStyle={[styles.dialogButtonLabel, i18n.locale === 'ar' && styles.selectedLanguageLabel]}
                      icon="check-circle"
                    >
                      عربي
                    </Button> */}
                  </Dialog.Content>
                </Dialog>
              </Portal>

              <Button
                mode="outlined"
                loading={loading}
                disabled={loading}
                onPress={onTestUser}
                style={styles.testButton}
              >
                {i18n.t('testUser')}
              </Button>

              <Button
                mode="outlined"
                onPress={clearAllSessions}
                style={styles.testButton}
                icon="delete"
              >
                Clear Session
              </Button>
            </Surface>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  inputView: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    borderRadius: 5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotPassword: {
    marginTop: 5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  orText: {
    marginHorizontal: 10,
    color: "#757575",
  },
  signUpText: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  signUpButton: {
    marginBottom: 10,
    borderRadius: 5,
    width: '100%'
  },
  testButton: {
    marginTop: 10,
  },
  buttonSignUp: {
    marginTop: 10,
    borderRadius: 5,
  },
  buttonContentSignUp: {
    paddingVertical: 8,
  },
  languageButton: {
    marginTop: 10,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dialogContent: {
    paddingHorizontal: 10,
  },
  dialogButton: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    paddingVertical: 8,
  },
  dialogButtonLabel: {
    fontSize: 16,
  },
  selectedLanguage: {
    backgroundColor: Colors.light.primaryColor,
  },
  selectedLanguageLabel: {
    color: 'white',
  }
});

export default LoginForm;
