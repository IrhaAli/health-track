import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "expo-router";
import { TextInput, Button, Text } from "react-native-paper";
import { Alert } from "react-native";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  const onSubmit = () => {
    setIsLoading(true);
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (email.length === 0) {
      Alert.alert("Email field is empty.");
    } else if (reg.test(email) === false) {
      Alert.alert("This is not a valid email.");
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setIsEmailSent(true);
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
      });
    setIsLoading(false);
  };

  return !isEmailSent ? (
    <>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCorrect={false}
        placeholder="name@email.com"
        editable={!isLoading}
        autoCapitalize="none"
        style={[{ marginTop: 80 }]}
      />
      <Button
        loading={isLoading}
        mode="contained"
        disabled={isLoading}
        onPress={onSubmit}
      >
        Reset Password
      </Button>
      <Link href="/login">Login</Link>
    </>
  ) : (
    <>
      <Text style={[{ marginTop: 80 }]}>
        Email Sent! If you have an account with us, an email will be sent.
        Please, also check your junk mail.
      </Text>
      <Button mode="outlined" style={[{ marginLeft: 10 }]}>
        <Link href="/login">SIGN IN</Link>
      </Button>
    </>
  );
};

export default ForgotPassword;
