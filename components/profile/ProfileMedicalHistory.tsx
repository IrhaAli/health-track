import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useEffect, useState } from "react";
import MedicalHistory from "@/components/user_info/MedicalHistory";
import { db } from "../../services/firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/profile.json';

export default function ProfileMedicalHistory() {
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [t, setT] = useState<any>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Get language first
        const language = await AsyncStorage.getItem('userLanguage');
        const effectiveLanguage = language || 'en';
        setCurrentLanguage(effectiveLanguage);
        setT(translations[effectiveLanguage as keyof typeof translations]);

        // Then get user
        const userString = await AsyncStorage.getItem('session');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        // Fallback to English if there's an error
        setCurrentLanguage('en');
        setT(translations.en);
      }
    };

    initialize();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const languageListener = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language && language !== currentLanguage) {
          setCurrentLanguage(language);
          setT(translations[language as keyof typeof translations]);
        }
      } catch (error) {
        console.error('Error getting language:', error);
      }
    };

    const interval = setInterval(languageListener, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage]);

  const fetchData = async (collectionName: string) => {
    const collectionData = query(
      collection(db, collectionName),
      where("user_id", "==", currentUser?.uid)
    );
    const querySnapshot = await getDocs(collectionData);
    let docData: any[] = [];

    querySnapshot.docs.forEach((doc) => {
      docData.push({
        docId: doc.id,
        ...doc.data(),
        is_deleted: false,
        diagnosis_date: new Date(
          doc.data().diagnosis_date.toDate().toISOString()
        ),
      });
    });
    return collectionName === "medical_history" ? docData : docData[0];
  };

  useEffect(() => {
    const getData = async () => {
      const medicalInfo = await fetchData("medical_history");
      setMedicalHistory(medicalInfo);
    };
    if (currentUser) {
      getData();
    }
  }, [currentUser]);

  const onSubmit = async () => {
    setIsEdit(false);
    setIsDisabled(true);
    try {
      medicalHistory.forEach(async (item: any) => {
        if (item.docId && item.is_deleted) {
          await deleteDoc(doc(db, "medical_history", item.docId));
        } else if (!item.docId) {
          await addDoc(collection(db, "medical_history"), {
            user_id: item.user_id,
            condition: item.condition,
            diagnosis_date: item.diagnosis_date,
            treatment_status: item.treatment_status,
            allergies: item.allergies,
          });
        }
      });
    } catch (err) {
      console.log("onSubmit Medical History", err);
    }
    setIsDisabled(false);
  };

  if (!t) return null; // Don't render until translations are loaded

  return (
    <View style={[{ marginTop: 0 }]}>
      {isEdit ? (
        <>
          <View
            style={styles.buttonView}
            pointerEvents={isDisabled ? "none" : "auto"}
          >
            <Pressable style={styles.button} onPress={onSubmit}>
              <Text style={styles.buttonText}>{t.submit}</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => setIsEdit(false)}>
              <Text style={styles.buttonText}>{t.cancel}</Text>
            </Pressable>
          </View>
          <MedicalHistory
            medicalHistory={medicalHistory}
            setMedicalHistory={setMedicalHistory}
          />
        </>
      ) : (
        <>
          <View style={styles.buttonView}>
            <Pressable style={styles.button} onPress={() => setIsEdit(true)}>
              <Text style={styles.buttonText}>{t.edit}</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>{t.medicalHistory}</Text>
          {medicalHistory.length > 0 ? (
            medicalHistory.map((item: any, index: number) => {
              return (
                !item.is_deleted && (
                  <View key={index}>
                    <Text>{item.condition}</Text>
                    <Text>{item.treatment_status}</Text>
                    <Text>{`${item.diagnosis_date}`}</Text>
                    <Text>{item.allergies}</Text>
                  </View>
                )
              );
            })
          ) : (
            <Text>{t.noMedicalHistory}</Text>
          )}
        </>
      )}
    </View>
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
