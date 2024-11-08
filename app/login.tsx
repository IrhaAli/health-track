import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Alert, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import "../firebaseConfig";
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/auth.json';

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const dispatch = useDispatch<AppDispatch>();
  const { signIn } = useSession();
  const auth = getAuth();
  const theme = useTheme();

  useEffect(() => {
    const getLanguage = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language) {
          setCurrentLanguage(language);
        }
      } catch (error) {
        console.error('Error getting language:', error);
      }
    };
    getLanguage();
  }, []);

  const t = translations[currentLanguage as keyof typeof translations];

  const handleLanguageSelect = async (language: string) => {
    try {
      await AsyncStorage.setItem('userLanguage', language);
      setCurrentLanguage(language);
      setLanguageDialogVisible(false);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const onSubmit = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    setEmailError("");
    setPasswordError("");

    if (email.length === 0) {
      setEmailError(t.emailEmpty);
      return;
    } else if (reg.test(email) === false) {
      setEmailError(t.emailInvalid);
      return;
    } else if (password.length === 0) {
      setPasswordError(t.passwordEmpty);
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
          setEmailError(t.emailNotFound);
        } else if (error.code === "auth/wrong-password") {
          setPasswordError(t.passwordInvalid);
        } else {
          setEmailError(error.message);
        }
        setLoading(false);
      });
  };

  const onTestUser = () => {
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
  };

  const clearAllSessions = async () => {
    try {
      await AsyncStorage.clear();
      await auth.signOut();
      dispatch(setUser(null));
      dispatch(setUserId(null));
      Alert.alert('Success', 'All sessions cleared successfully');
    } catch (error) {
      console.error('Error clearing sessions:', error);
      Alert.alert('Error', 'Failed to clear sessions');
    }
  };

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
                  label={t.email}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  autoCorrect={false}
                  placeholder={t.emailPlaceholder}
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
                  label={t.password}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                  }}
                  autoCorrect={false}
                  autoCapitalize="none"
                  secureTextEntry={isPasswordHidden}
                  editable={!loading}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={isPasswordHidden ? "eye-off" : "eye"}
                      onPress={() => setPasswordHidden(!isPasswordHidden)}
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
                {t.signIn}
              </Button>

              <Link href="/forgot_password" style={{ alignSelf: 'center' }}>
                <Button
                  mode="text"
                  style={styles.forgotPassword}
                  labelStyle={{ fontSize: 16 }}
                >{t.forgotPassword}</Button>
              </Link>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text variant="bodySmall" style={styles.orText}>
                  {t.or}
                </Text>
                <View style={styles.line} />
              </View>

              <View style={styles.signUpText}>
                <Text variant="bodyMedium">{t.noAccount}</Text>
              </View>

              <Link href="/register" asChild>
                <Button
                  mode="contained"
                  style={styles.buttonSignUp}
                  labelStyle={{ fontSize: 16 }}
                  contentStyle={styles.buttonContentSignUp}
                >
                  {t.signUpNow}
                </Button>
              </Link>

              <Button
                mode="text"
                style={styles.languageButton}
                labelStyle={{ fontSize: 16 }}
                icon="translate"
                onPress={() => setLanguageDialogVisible(true)}
              >
                {t.changeLanguage}
              </Button>

              <Portal>
                <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
                  <Dialog.Title style={styles.dialogTitle}>{t.selectLanguage}</Dialog.Title>
                  <Dialog.Content style={styles.dialogContent}>
                    <Button
                      mode="contained-tonal"
                      onPress={() => handleLanguageSelect('en')}
                      style={[styles.dialogButton, currentLanguage === 'en' && styles.selectedLanguage]}
                      labelStyle={[styles.dialogButtonLabel, currentLanguage === 'en' && styles.selectedLanguageLabel]}
                      icon="check-circle"
                    >
                      English
                    </Button>
                    <Button
                      mode="contained-tonal"
                      onPress={() => handleLanguageSelect('fr')}
                      style={[styles.dialogButton, currentLanguage === 'fr' && styles.selectedLanguage]}
                      labelStyle={[styles.dialogButtonLabel, currentLanguage === 'fr' && styles.selectedLanguageLabel]}
                      icon="check-circle"
                    >
                      Français
                    </Button>
                    <Button
                      mode="contained-tonal"
                      onPress={() => handleLanguageSelect('ar')}
                      style={[styles.dialogButton, currentLanguage === 'ar' && styles.selectedLanguage]}
                      labelStyle={[styles.dialogButtonLabel, currentLanguage === 'ar' && styles.selectedLanguageLabel]}
                      icon="check-circle"
                    >
                      عربي
                    </Button>
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
                {t.testUser}
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
    backgroundColor: 'tomato',
  },
  selectedLanguageLabel: {
    color: 'white',
  }
});

export default LoginForm;
