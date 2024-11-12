import React, { useState, useEffect } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import StressLevel from "@/components/user_info/StressLevel";
import { Pressable, View, Text, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StressLevelPanel() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stressLevel, setStressLevel] = useState({
    stressLevel: 0,
    notes: "",
  });

  useEffect(() => {
    const getUser = async () => {
      const userString = await AsyncStorage.getItem('session');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user);
      }
    };
    getUser();
  }, []);

  const onSubmit = async () => {
    await addDoc(collection(db, "stress_level"), {
      user_id: currentUser?.uid,
      stress_level: stressLevel.stressLevel,
      notes: stressLevel.notes,
    });
    router.push("/(root)");
  };

  return (
    <>
      <StressLevel stressLevel={stressLevel} setStressLevel={setStressLevel} />
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </Pressable>
      </View>
      <Link href={"/(root)"}>Skip</Link>
    </>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
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
});
