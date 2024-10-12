import { StyleSheet, TextInput, Text } from "react-native";
import { useState } from "react";
import { Button } from "react-native-paper";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getAuth } from "firebase/auth";

export default function ProfileContactForm() {
  const auth = getAuth();

  const [contactUs, setContactUs] = useState({
    subject: "",
    text: "",
  });

  const onContactSend = async () => {
    await addDoc(collection(db, "contact"), {
      user_id: auth.currentUser?.uid,
      ...contactUs,
      date: new Date(),
    });
    setContactUs({ subject: "", text: "" });
  };

  return (
    <>
      <Text>Contact Us</Text>
      <TextInput
        style={styles.subjectInput}
        placeholder="Subject"
        value={contactUs.subject}
        onChangeText={(item: string) => {
          setContactUs((prev) => ({ ...prev, subject: item }));
        }}
        autoCorrect={false}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={5}
        placeholder="Contact us here..."
        value={contactUs.text}
        onChangeText={(item: string) => {
          setContactUs((prev) => ({ ...prev, text: item }));
        }}
        autoCorrect={false}
        autoCapitalize="sentences"
      />
      <Button mode="contained" onPress={onContactSend}>
        Send
      </Button>
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
  subjectInput: {
    height: 40,
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
