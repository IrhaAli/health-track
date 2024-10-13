import { getAuth } from "firebase/auth";
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

export default function ProfileUserDetails() {
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
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
    healthGoal: string | null;
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
  const auth = getAuth();

  const fetchData = async (collectionName: string) => {
    try {
      const collectionData = query(
        collection(db, collectionName),
        where("user_id", "==", auth.currentUser?.uid)
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
    getData();
  }, []);

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
              <Text style={styles.buttonText}>Submit</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => setIsEdit(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
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
              <Text style={styles.buttonText}>Edit</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Background Information</Text>
          <Text>Date of Birth: {`${userDetails.dob}`}</Text>
          <Text>Gender: {userDetails.gender}</Text>
          <Text>Height: {userDetails.height}</Text>
          <Text>Weight: {userDetails.weight}</Text>
          <Text>Body Type: {userDetails.bodyType}</Text>
          <Text>Activity Type: {userDetails.activityType}</Text>
          <Text>Wakeup Time: {`${userDetails.wakeupTime}`}</Text>
          <Text>Sleep Time: {`${userDetails.sleepTime}`}</Text>
          <Text>Health Goal: {userDetails.healthGoal}</Text>
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
