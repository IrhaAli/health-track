import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "expo-router";
import { TextInput, Button, Text, Surface, useTheme, HelperText } from "react-native-paper";
import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

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
      setEmailError("Email field is empty.");
      setIsLoading(false);
      return;
    } else if (reg.test(email) === false) {
      setEmailError("This is not a valid email.");
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
                Reset Password
              </Text>

              {!isEmailSent ? (
                <>
                  <Text variant="bodyLarge" style={styles.subtitle}>
                    Enter your email address and we'll send you instructions to reset your password.
                  </Text>

                  <View style={styles.inputView}>
                    <TextInput
                      mode="outlined"
                      label="Email"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setEmailError("");
                      }}
                      autoCorrect={false}
                      placeholder="name@email.com"
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
                    Send Reset Link
                  </Button>

                  <Link href="/login" asChild>
                    <Button
                      mode="text"
                      style={styles.backButton}
                      labelStyle={{ fontSize: 16 }}
                    >
                      Back to Login
                    </Button>
                  </Link>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <Text variant="headlineSmall" style={styles.successTitle}>
                    Email Sent!
                  </Text>
                  
                  <Text variant="bodyLarge" style={styles.successText}>
                    If you have an account with us, an email will be sent with password reset instructions.
                    Please check your inbox and spam folder.
                  </Text>

                  <Link href="/login" asChild>
                    <Button
                      mode="contained"
                      style={styles.button}
                      labelStyle={{ fontSize: 16 }}
                      contentStyle={styles.buttonContent}
                    >
                      Return to Login
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
