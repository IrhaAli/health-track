import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Alert, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import "../../firebaseConfig";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button, TextInput, Text } from "react-native-paper";
import { useDispatch } from "react-redux";
import { setUser, setUserId } from "@/store/userSlice";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (email.length === 0) {
      Alert.alert("Email field is empty.");
    } else if (reg.test(email) === false) {
      Alert.alert("This is not a valid email.");
    } else if (password.length === 0) {
      Alert.alert("Password field is empty.");
    } else {
      setLoading(true);
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user: any = userCredential.user;
          dispatch(setUser(JSON.stringify(user)));
          dispatch(setUserId(user.uid));
          router.push("/(tabs)");
          setLoading(false);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          Alert.alert(errorMessage);
          setLoading(false);
        });
    }
  };

  const onTestUser = () => {
    setEmail('test@test.com');
    setPassword('test1234');
    setLoading(true);

    const auth = getAuth();
    signInWithEmailAndPassword(auth, 'test@test.com', 'test1234')
      .then((userCredential) => {
        const user: any = userCredential.user;
        dispatch(setUser(JSON.stringify(user)));
        dispatch(setUserId(user.uid));
        router.push("/(tabs)");
        setLoading(false);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert(errorMessage);
        setLoading(false);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Health App</Text>

      <View style={styles.inputView}>
        <TextInput label="Email" value={email} onChangeText={setEmail} autoCorrect={false} placeholder="name@email.com" editable={!loading} autoCapitalize="none" />
      </View>

      <View style={styles.inputView}>
        <TextInput label="Password" placeholder="Password" value={password} onChangeText={setPassword} autoCorrect={false} autoCapitalize="none" secureTextEntry={isPasswordHidden} editable={!loading} />
        <Button mode="text" icon={isPasswordHidden ? 'eye-off' : 'eye'} style={styles.passwordEyeIcon} onPress={() => setPasswordHidden(!isPasswordHidden)}><></></Button>
      </View>

      <Button loading={loading} mode="contained" disabled={loading} onPress={onSubmit}>SIGN IN</Button>

      <View style={styles.signUpText}>
        <Text variant="titleMedium">Don't have an account?</Text>
        <Button mode="outlined" style={[{marginLeft: 10}]}><Link href="/(signup)">Sign Up</Link></Button>
      </View>

      <Button mode="contained" loading={loading} disabled={loading} onPress={onTestUser}>Test User</Button>
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
    color: "tomato",
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
    flexDirection: 'row'
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10
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
    right: 50,
    top: 10
  },
  signUpText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  }
});

export default LoginForm;
