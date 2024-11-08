import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Alert, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import "../firebaseConfig";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Button, TextInput, Text, Surface, useTheme, HelperText } from "react-native-paper";
import { useDispatch } from "react-redux";
import { setUser, setUserId } from "@/store/userSlice";
import { useSession } from "@/ctx";
import { AppDispatch } from "@/store/store";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { signIn } = useSession();
  const auth = getAuth();
  const theme = useTheme();

  const onSubmit = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    setEmailError("");
    setPasswordError("");

    if (email.length === 0) {
      setEmailError("Email field is empty.");
      return;
    } else if (reg.test(email) === false) {
      setEmailError("This is not a valid email.");
      return;
    } else if (password.length === 0) {
      setPasswordError("Password field is empty.");
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
          setEmailError("No user found with this email.");
        } else if (error.code === "auth/wrong-password") {
          setPasswordError("Invalid password.");
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
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  autoCorrect={false}
                  placeholder="name@email.com"
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
                  label="Password"
                  placeholder="Password"
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
                Sign In
              </Button>


              <Link href="/forgot_password" style={{ alignSelf: 'center' }}>
                <Button
                  mode="text"
                  style={styles.forgotPassword}
                  labelStyle={{ fontSize: 16 }}
                >Forgot password?</Button>
              </Link>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text variant="bodySmall" style={styles.orText}>
                  OR
                </Text>
                <View style={styles.line} />
              </View>

              <View style={styles.signUpText}>
                <Text variant="bodyMedium">Don't have an account?</Text>
              </View>

              {/* <View>
                <Link href="/register" asChild>
                  <Button
                    mode="contained-tonal"
                    style={styles.signUpButton}
                    labelStyle={{ fontSize: 16 }}
                    contentStyle={{ height: 48 }}
                  >
                    Sign Up Now
                  </Button>
                </Link>
              </View> */}

              <Link href="/register" asChild>
                <Button
                  mode="contained"
                  style={styles.buttonSignUp}
                  labelStyle={{ fontSize: 16 }}
                  contentStyle={styles.buttonContentSignUp}
                >
                  Sign Up Now
                </Button>
              </Link>

              <Button
                mode="outlined"
                loading={loading}
                disabled={loading}
                onPress={onTestUser}
                style={styles.testButton}
              >
                Test User
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
});

export default LoginForm;
