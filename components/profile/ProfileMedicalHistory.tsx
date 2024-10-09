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
import MedicalHistory from "@/components/user_info/MedicalHistory";
import { db } from "../../firebaseConfig";

export default function ProfileMedicalHistory() {
  const uid =
    /* getAuth().currentUser?.uid || */ "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);

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
      const medicalInfo = await fetchData("medical_history");
      setMedicalHistory(medicalInfo);
    };
    getData();
  }, []);

  const onSubmit = async () => {
    setIsEdit(false);
    setIsDisabled(true);
    try {
      const updateMedicalHistory = medicalHistory.map((item: any) =>
        doc(db, "medical_history", item.docId)
      );
      updateMedicalHistory.forEach(
        async (item) =>
          await updateDoc(item, {
            allergies: item.allergies,
            condition: item.condition,
            diagnosis_date: item.diagnosis_date,
            treatment_status: item.treatment_status,
          })
      );
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
              <Text style={styles.buttonText}>Submit</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => setIsEdit(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
          <MedicalHistory
            uid={uid}
            medicalHistory={medicalHistory}
            setMedicalHistory={setMedicalHistory}
          />
        </>
      ) : (
        <>
          <View style={styles.buttonView}>
            <Pressable style={styles.button} onPress={() => setIsEdit(true)}>
              <Text style={styles.buttonText}>Edit</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Medical History</Text>
          {medicalHistory.map((item: any, index: number) => {
            return (
              <View key={index}>
                <Text>{item.allergies}</Text>
                <Text>{item.condition}</Text>
                <Text>{`${new Date(item.diagnosis_date.seconds)}`}</Text>
                <Text>{item.treatment_status}</Text>
              </View>
            );
          })}
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
