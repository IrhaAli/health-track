import { StyleSheet, Text, View } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useEffect, useState } from "react";
import { Avatar } from "react-native-paper";

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
    <View style={styles.container}>
      <Avatar.Image
        // style={styles.avatar}
        // rounded
        source={{
          uri: "https://tr.rbxcdn.com/63dc4f38b22fabffccefa6363a33dd06/420/420/Hat/Webp",
        }}
        size={24}
      />
      <View style={styles.textContainer}>
        <Text style={styles.text}>Name: {userInfo.fullName}</Text>
        <Text style={styles.text}>Email: {userInfo.email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textContainer: {
    display: "flex",
  },
  text: {
    fontSize: 18,
  },
});
