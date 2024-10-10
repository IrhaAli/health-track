import { getAuth } from "firebase/auth";
import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import AlertAsync from "react-native-alert-async";
import { Button } from "react-native-paper";

export default function ProfileFooterLinks() {
  const uid =
    /* getAuth().currentUser?.uid || */ "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [contactUs, setContactUs] = useState("");

  const onContactSend = () => {
    console.log("Contacted");
    setContactUs("");
  };

  const onLogout = () => {
    console.log("Logged Out");
  };

  const onAccountDelete = async () => {
    const choice = await AlertAsync(
      "Are you sure you want to delete your account?",
      "Your Account will be deleted permanently",
      [
        { text: "Yes", onPress: () => true },
        { text: "No", onPress: () => false },
      ]
    );

    if (!choice) return;
    // Change is_deleted to true in users table
    console.log("Account Deleted");
    onLogout();
  };

  return (
    <>
      <Text>Contact Us</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={5}
        placeholder="Contact us here..."
        value={contactUs}
        onChangeText={(item: string) => {
          setContactUs(item);
        }}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <Button mode="contained" onPress={onContactSend}>
        Send
      </Button>
      <Button mode="contained" onPress={onLogout}>
        Logout
      </Button>
      <View style={styles.links}>
        <Text style={styles.buttonTextRed} onPress={onAccountDelete}>
          Delete My Account
        </Text>
        <Link href="www.google.com">
          <Text style={styles.buttonTextBlue}>Privacy Policy</Text>
        </Link>
        <Link href="www.google.com">
          <Text style={styles.buttonTextBlue}>Terms and Conditions</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  links: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  appLogo: {
    height: 250,
    width: 400,
  },
  input: {
    height: 200,
    paddingHorizontal: 20,
    borderColor: "tomato",
    borderWidth: 1,
    borderRadius: 7,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
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
  buttonTextRed: {
    color: "red",
  },
  buttonTextBlue: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
