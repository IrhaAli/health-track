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
import { db } from "../../services/firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

export default function ProfileUserDetails() {
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
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

  return (
    <View style={[{ marginTop: 80 }]}>
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
              <Text style={styles.buttonText}>{i18n.t('edit')}</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>{i18n.t('backgroundInformation')}</Text>
          <Text>{i18n.t('dateOfBirth')}: {`${userDetails.dob}`}</Text>
          <Text>{i18n.t('gender')}: {userDetails.gender}</Text>
          <Text>{i18n.t('height')}: {userDetails.height}</Text>
          <Text>{i18n.t('weight')}: {userDetails.weight}</Text>
          <Text>{i18n.t('bodyType')}: {userDetails.bodyType}</Text>
          <Text>{i18n.t('activityType')}: {userDetails.activityType}</Text>
          <Text>{i18n.t('wakeupTime')}: {`${userDetails.wakeupTime}`}</Text>
          <Text>{i18n.t('sleepTime')}: {`${userDetails.sleepTime}`}</Text>
          <Text>{i18n.t('healthGoal')}: {userDetails.healthGoal}</Text>
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