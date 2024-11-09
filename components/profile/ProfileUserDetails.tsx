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
import UserDetails from "@/components/user_info/UserDetails";
import { db } from "../../firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/profile.json';

export default function ProfileUserDetails() {
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [t, setT] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<{
    docId: string | null;
    gender: string | null;
    bodyType: string | null;
    activityType: string | null;
    height: string;
    weight: string;
    dob: Date | null;
    wakeupTime: Date | null;
    sleepTime: Date | null;
    healthGoal: string;
  }>({
    docId: null,
    gender: null,
    bodyType: null,
    activityType: null,
    dob: null,
    height: "",
    weight: "",
    wakeupTime: null,
    sleepTime: null,
    healthGoal: "",
  });

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
    try {
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
          dob: doc.data().dob.toDate().toISOString(),
          wakeup_time: doc.data().wakeup_time.toDate().toISOString(),
          sleep_time: doc.data().sleep_time.toDate().toISOString(),
        });
      });

      return collectionName === "medical_history" ? docData : docData[0];
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const userInfo = await fetchData("user_details");
      setUserDetails({
        docId: userInfo.docId,
        gender: userInfo.gender,
        height: userInfo.height,
        weight: userInfo.weight,
        bodyType: userInfo.body_type,
        activityType: userInfo.activity,
        dob: new Date(userInfo.dob),
        wakeupTime: new Date(userInfo.wakeup_time),
        sleepTime: new Date(userInfo.sleep_time),
        healthGoal: userInfo.health_goal,
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
      if (userDetails.docId) {
        const updateUserDetails = doc(db, "user_details", userDetails.docId);
        await updateDoc(updateUserDetails, {
          body_type: userDetails.bodyType,
          activity: userDetails.activityType,
          health_goal: userDetails.healthGoal,
          wakeup_time: userDetails.wakeupTime,
          sleep_time: userDetails.sleepTime,
        });
      }
    } catch (err) {
      console.log(err);
    }
    setIsDisabled(false);
  };

  if (!t) return null; // Don't render until translations are loaded

  return (
    <View style={[{ marginTop: 80 }]}>
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
          <UserDetails
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            isSignUpPage={false}
          />
        </>
      ) : (
        <>
          <View style={styles.buttonView}>
            <Pressable style={styles.button} onPress={() => setIsEdit(true)}>
              <Text style={styles.buttonText}>{t.edit}</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>{t.backgroundInformation}</Text>
          <Text>{t.dateOfBirth}: {`${userDetails.dob}`}</Text>
          <Text>{t.gender}: {userDetails.gender}</Text>
          <Text>{t.height}: {userDetails.height}</Text>
          <Text>{t.weight}: {userDetails.weight}</Text>
          <Text>{t.bodyType}: {userDetails.bodyType}</Text>
          <Text>{t.activityType}: {userDetails.activityType}</Text>
          <Text>{t.wakeupTime}: {`${userDetails.wakeupTime}`}</Text>
          <Text>{t.sleepTime}: {`${userDetails.sleepTime}`}</Text>
          <Text>{t.healthGoal}: {userDetails.healthGoal}</Text>
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