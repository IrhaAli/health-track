import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Alert } from "react-native";
import { Link, router } from "expo-router";
import "../firebaseConfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { TextInput, Button, Text } from "react-native-paper";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const [isConfirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    let errorMessage = "";
    if (email.length === 0) {
      errorMessage = "Email field is empty.";
    } else if (reg.test(email) === false) {
      errorMessage = "This is not a valid email.";
    } else if (password.length === 0) {
      errorMessage = "Password field is empty.";
    } else if (password !== confirmPassword) {
      errorMessage = "The password does not match.";
    }
    if (errorMessage.length > 0) {
      Alert.alert(errorMessage);
      return;
    }

    setLoading(true);
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user: any = userCredential.user;
        const userInfo = {
          email: user.email,
          uid: user.uid,
          auth_type: "EMAIL_PASSWORD",
        };
        setLoading(false);
        console.log("Line 39 register");
        router.push({ pathname: "/(signup_questionnaire)", params: userInfo });
      })
      .catch((error) => {
        setLoading(false);
        const errorMessage = error.message;
        Alert.alert(errorMessage);
      });
  };

  const onTestUser = () => {
    setEmail("test@test.com");
    setPassword("test1234");
    setConfirmPassword("test1234");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text
        variant="headlineLarge"
        style={[{ paddingVertical: 30, color: "tomato" }]}
      >
        Health App
      </Text>

      <View style={styles.inputView}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCorrect={false}
          placeholder="name@email.com"
          editable={!loading}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          label="Password"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry={isPasswordHidden}
          editable={!loading}
        />
        <Button
          mode="text"
          icon={isPasswordHidden ? "eye-off" : "eye"}
          style={styles.passwordEyeIcon}
          onPress={() => setPasswordHidden(!isPasswordHidden)}
        >
          <></>
        </Button>
      </View>

      <View style={styles.inputView}>
        <TextInput
          label="Confirm Password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry={isConfirmPasswordHidden}
          editable={!loading}
        />
        <Button
          mode="text"
          icon={isConfirmPasswordHidden ? "eye-off" : "eye"}
          style={styles.passwordEyeIcon}
          onPress={() => setConfirmPasswordHidden(!isConfirmPasswordHidden)}
        >
          <></>
        </Button>
      </View>

      <Button
        loading={loading}
        mode="contained"
        disabled={loading}
        onPress={onSubmit}
      >
        SIGN UP
      </Button>

      <View style={styles.signUpText}>
        <Text variant="titleMedium">Already have an account?</Text>
        <Button mode="outlined" style={[{ marginLeft: 10 }]}>
          <Link href="/login">SIGN IN</Link>
        </Button>
      </View>
      <Button
        mode="contained"
        loading={loading}
        disabled={loading}
        onPress={onTestUser}
      >
        Test User
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  inputView: {
    width: "100%",
    paddingHorizontal: 40,
    marginVertical: 5,
  },
  passwordEyeIcon: {
    position: "absolute",
    right: 50,
    top: 10,
  },
  signUpText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
});

export default SignupForm;
