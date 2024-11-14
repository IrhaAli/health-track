import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "expo-router";
import { TextInput, Button, Text, Surface, useTheme, HelperText } from "react-native-paper";
import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import i18n from '@/services/i18n';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const auth = getAuth();
  const theme = useTheme();

  const onSubmit = () => {
    setIsLoading(true);
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (email.length === 0) {
      setEmailError(i18n.t('emailEmpty'));
      setIsLoading(false);
      return;
    } else if (reg.test(email) === false) {
      setEmailError(i18n.t('emailInvalid'));
      setIsLoading(false);
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setIsEmailSent(true);
      })
      .catch((error) => {
        setEmailError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
                {i18n.t('resetPassword')}
              </Text>

              {!isEmailSent ? (
                <>
                  <Text variant="bodyLarge" style={styles.subtitle}>
                    {i18n.t('resetInstructions')}
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
                      editable={!isLoading}
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

                  <Button
                    loading={isLoading}
                    mode="contained"
                    disabled={isLoading}
                    onPress={onSubmit}
                    style={styles.button}
                    labelStyle={{ fontSize: 16 }}
                    contentStyle={styles.buttonContent}
                  >
                    {i18n.t('sendResetLink')}
                  </Button>

                  <Link href="/login" asChild>
                    <Button
                      mode="text"
                      style={styles.backButton}
                      labelStyle={{ fontSize: 16 }}
                    >
                      {i18n.t('backToLogin')}
                    </Button>
                  </Link>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <Text variant="headlineSmall" style={styles.successTitle}>
                    {i18n.t('emailSent')}
                  </Text>
                  
                  <Text variant="bodyLarge" style={styles.successText}>
                    {i18n.t('checkInbox')}
                  </Text>

                  <Link href="/login" asChild>
                    <Button
                      mode="contained"
                      style={styles.button}
                      labelStyle={{ fontSize: 16 }}
                      contentStyle={styles.buttonContent}
                    >
                      {i18n.t('returnToLogin')}
                    </Button>
                  </Link>
                </View>
              )}
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
    marginBottom: 20,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputView: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    borderRadius: 5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 15,
  },
  successContainer: {
    alignItems: "center",
    padding: 20,
  },
  successTitle: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  successText: {
    textAlign: "center",
    marginBottom: 30,
  }
});

export default ForgotPassword;