import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Link, router } from "expo-router";
import "../services/firebaseConfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { TextInput, Button, Text, Surface, useTheme, HelperText } from "react-native-paper";
import i18n from '@/services/i18n';

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const theme = useTheme();

  const onSubmit = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (email.length === 0) {
      setEmailError(i18n.t('emailEmpty'));
      return;
    } else if (reg.test(email) === false) {
      setEmailError(i18n.t('emailInvalid'));
      return;
    } else if (password.length === 0) {
      setPasswordError(i18n.t('passwordEmpty'));
      return;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(i18n.t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user: any = userCredential.user;
        const userInfo = {
          email: user.email,
          user_id: user.uid,
          auth_type: "EMAIL_PASSWORD",
        };
        setLoading(false);
        router.push({ pathname: "/(signup_questionnaire)", params: userInfo });
      })
      .catch((error) => {
        setLoading(false);
        setEmailError(error.message);
      });
  };

  const onTestUser = () => {
    setEmail("test" + `${Math.floor(Math.random() * 1000)}` + "@test.com");
    setPassword("test1234");
    setConfirmPassword("test1234");
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
                {i18n.t('createAccount')}
              </Text>

              <View style={styles.inputView}>
                <TextInput
                  mode="outlined"
                  label={i18n.t('email')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
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

              <View style={styles.inputView}>
                <TextInput
                  mode="outlined"
                  label={i18n.t('confirmPassword')}
                  placeholder={i18n.t('confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError("");
                  }}
                  autoCorrect={false}
                  autoCapitalize="none"
                  secureTextEntry={isConfirmPasswordHidden}
                  editable={!loading}
                  left={<TextInput.Icon icon="lock-check" />}
                  right={
                    <TextInput.Icon
                      icon={isConfirmPasswordHidden ? "eye-off" : "eye"}
                      onPress={() => setConfirmPasswordHidden(!isConfirmPasswordHidden)}
                    />
                  }
                  error={!!confirmPasswordError}
                />
                {confirmPasswordError ? (
                  <HelperText type="error" visible={!!confirmPasswordError}>
                    {confirmPasswordError}
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
                {i18n.t('signUp')}
              </Button>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text variant="bodySmall" style={styles.orText}>
                  {i18n.t('or')}
                </Text>
                <View style={styles.line} />
              </View>

              <View style={styles.signInContainer}>
                <Text variant="bodyMedium">{i18n.t('haveAccount')}</Text>
              </View>

              <Link href="/login" asChild>
                <Button
                  mode="contained"
                  style={styles.signInButton}
                  labelStyle={{ fontSize: 16 }}
                  contentStyle={styles.buttonContentSignIn}
                >
                  {i18n.t('signIn')}
                </Button>
              </Link>

              <Button
                mode="outlined"
                loading={loading}
                disabled={loading}
                onPress={onTestUser}
                style={styles.testButton}
              >
                {i18n.t('testUser')}
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
  signInContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signInButton: {
    marginTop: 10,
    borderRadius: 5,
  },
  testButton: {
    marginTop: 10,
  },
  buttonContentSignIn: {
    paddingVertical: 8,
  },
});

export default SignupForm;
