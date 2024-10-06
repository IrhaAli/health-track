import React, { useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button, Alert, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { SocialIcon } from "@rneui/base";
import "../../firebaseConfig";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setPasswordHidden] = useState(true);

  const onSubmit = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (email.length === 0) {
      Alert.alert("Email field is empty.");
    } else if (reg.test(email) === false) {
      Alert.alert("This is not a valid email.");
    } else if (password.length === 0) {
      Alert.alert("Password field is empty.");
    } else {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          router.push("/(tabs)");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          Alert.alert(errorMessage);
        });
    }
  };

  const onTestUser = () => {
    const auth = getAuth();
      signInWithEmailAndPassword(auth, 'test@test.com', 'test1234')
        .then((userCredential) => {
          const user = userCredential.user;
          router.push("/(tabs)");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          Alert.alert(errorMessage);
        });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Health App</Text>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="EMAIL"
          value={email}
          onChangeText={setEmail}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="PASSWORD"
          value={password}
          onChangeText={setPassword}
          autoCorrect={false}
          autoCapitalize="none"
          secureTextEntry={isPasswordHidden}
        />
        <TouchableOpacity style={styles.passwordEyeIcon} onPress={() => setPasswordHidden(!isPasswordHidden)} >
          <Icon name={isPasswordHidden ? 'eye-slash' : 'eye'} size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>SIGN IN</Text>
        </Pressable>
      </View>
      <Text>Don't have an account? </Text>
      <Link href="/(signup)">Sign Up</Link>
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onTestUser}>
          <Text style={styles.buttonText}>TEST USER</Text>
        </Pressable>
      </View>
      {/* <Text style={styles.optionsText}>OR LOGIN WITH</Text>
      <View style={styles.socialIcons}>
        <SocialIcon button type="facebook" />
        <SocialIcon button type="google" />
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  socialIcons: {
    display: "flex",
    flexDirection: "row",
  },
  container: {
    alignItems: "center",
    paddingTop: 70,
  },
  image: {
    height: 160,
    width: 170,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 7,
  },
  rememberView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  switch: {
    flexDirection: "row",
    gap: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 13,
  },
  forgetText: {
    fontSize: 11,
    color: "red",
  },
  button: {
    backgroundColor: "red",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
  },
  optionsText: {
    textAlign: "center",
    paddingVertical: 10,
    color: "gray",
    fontSize: 13,
    marginBottom: 6,
  },
  mediaIcons: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
  },
  icons: {
    width: 40,
    height: 40,
  },
  footerText: {
    textAlign: "center",
    color: "gray",
  },
  signup: {
    color: "red",
    fontSize: 13,
  },
  passwordEyeIcon: {
    position: 'absolute',
    right: 60,
    top: 15
  },
});

export default LoginForm;
