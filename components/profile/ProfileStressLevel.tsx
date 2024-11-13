import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useEffect, useState } from "react";
import StressLevel from "@/components/user_info/StressLevel";
import { db } from "../../services/firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

export default function ProfileStressLevel() {
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stressLevel, setStressLevel] = useState({
    docId: null,
    stressLevel: 0,
    notes: "",
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const userString = await AsyncStorage.getItem('session');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };

    initialize();
  }, []);

  const fetchData = async (collectionName: string) => {
    const collectionData = query(
      collection(db, collectionName),
      where("user_id", "==", currentUser?.uid)
    );
    const querySnapshot = await getDocs(collectionData);
    let docData: any[] = [];

    querySnapshot.docs.forEach((doc) => {
      docData.push({ docId: doc.id, ...doc.data() });
    });

    return collectionName === "medical_history" ? docData : docData[0];
  };

  useEffect(() => {
    const getData = async () => {
      const stressInfo = await fetchData("stress_level");
      setStressLevel({
        docId: stressInfo.docId,
        stressLevel: stressInfo.stress_level,
        notes: stressInfo.notes,
      });
    };
    if (currentUser) {
      getData();
    }
  }, [currentUser]);

  const onSubmit = async () => {
    setIsEdit(false);
    setIsDisabled(true);
    try {
      if (stressLevel.docId) {
        const updateStressLevelDetails = doc(
          db,
          "stress_level",
          stressLevel.docId
        );
        await updateDoc(updateStressLevelDetails, {
          stress_level: stressLevel.stressLevel,
          notes: stressLevel.notes,
        });
      }
    } catch (err) {
      console.log(err);
    }
    setIsDisabled(false);
  };

  return (
    <>
      {isEdit ? (
        <>
          <View
            style={styles.buttonView}
            pointerEvents={isDisabled ? "none" : "auto"}
          >
            <Pressable style={styles.button} onPress={onSubmit}>
              <Text style={styles.buttonText}>{i18n.t('submit')}</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => setIsEdit(false)}>
              <Text style={styles.buttonText}>{i18n.t('cancel')}</Text>
            </Pressable>
          </View>
          <StressLevel
            stressLevel={stressLevel}
            setStressLevel={setStressLevel}
          />
        </>
      ) : (
        <>
          <View style={styles.buttonView}>
            <Pressable style={styles.button} onPress={() => setIsEdit(true)}>
              <Text style={styles.buttonText}>{i18n.t('edit')}</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>{i18n.t('stressLevel')}</Text>
          <Text>{i18n.t('stressLevel')}: {stressLevel.stressLevel}</Text>
          <Text>{i18n.t('notes')}: {stressLevel.notes}</Text>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
  input: {
    height: 200,
    paddingHorizontal: 20,
    borderColor: "red",
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
