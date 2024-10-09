import { StyleSheet, Text } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useEffect, useState } from "react";

export default function ProfileHeader() {
  const uid =
    /* getAuth().currentUser?.uid || */ "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
  });

  const fetchData = async (collectionName: string) => {
    const collectionData = query(
      collection(db, collectionName),
      where("user_id", "==", uid)
    );
    const querySnapshot = await getDocs(collectionData);
    let docData: any[] = [];

    querySnapshot.forEach((doc) => {
      docData.push({ id: doc.id, ...doc.data() });
    });
    return collectionName === "medical_history" ? docData : docData[0];
  };

  useEffect(() => {
    const getData = async () => {
      const userInfo = await fetchData("users");
      setUserInfo({
        fullName: userInfo.full_name,
        email: userInfo.email,
      });
    };
    getData();
  }, []);

  return (
    <>
      <Text style={styles.title}>My Profile</Text>
      <Text>Name: {userInfo.fullName}</Text>
      <Text>Email: {userInfo.email}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
});
