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
import { StyleSheet, View, SafeAreaView } from "react-native";
import { useEffect, useState } from "react";
import MedicalHistory from "@/components/user_info/MedicalHistory";
import { db } from "../../services/firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/services/i18n';
import { Appbar, Button, Card, Text, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

interface ProfileMedicalHistoryProps {
  showNavigation?: boolean;
}

export default function ProfileMedicalHistory({ showNavigation = false }: ProfileMedicalHistoryProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const theme = useTheme();

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

  return (
    <SafeAreaView style={styles.container}>
      {showNavigation && (
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.push('/profile')} />
          <Appbar.Content title={i18n.t('medicalHistory')} style={{alignItems: 'center'}} />
        </Appbar.Header>
      )}
      <Surface style={styles.surface}>
        {isEdit ? (
          <>
            <View style={styles.buttonContainer}>
              <Button 
                mode="contained" 
                onPress={onSubmit}
                disabled={isDisabled}
                style={styles.button}
              >
                {i18n.t('submit')}
              </Button>
              <Button 
                mode="outlined"
                onPress={() => setIsEdit(false)}
                disabled={isDisabled}
                style={styles.button}
              >
                {i18n.t('cancel')}
              </Button>
            </View>
            <MedicalHistory
              medicalHistory={medicalHistory}
              setMedicalHistory={setMedicalHistory}
            />
          </>
        ) : (
          <>
            <Button 
              mode="contained"
              onPress={() => setIsEdit(true)}
              style={styles.editButton}
            >
              {i18n.t('edit')}
            </Button>
            <Text variant="headlineMedium" style={styles.title}>
              {i18n.t('medicalHistory')}
            </Text>
            {medicalHistory.length > 0 ? (
              medicalHistory.map((item: any, index: number) => {
                return (
                  !item.is_deleted && (
                    <Card key={index} style={styles.card}>
                      <Card.Content>
                        <Text variant="titleMedium">{item.condition}</Text>
                        <Text variant="bodyMedium">{item.treatment_status}</Text>
                        <Text variant="bodyMedium">{`${item.diagnosis_date}`}</Text>
                        <Text variant="bodyMedium">{item.allergies}</Text>
                      </Card.Content>
                    </Card>
                  )
                );
              })
            ) : (
              <Text variant="bodyLarge" style={styles.noData}>
                {i18n.t('noMedicalHistory')}
              </Text>
            )}
          </>
        )}
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  surface: {
    flex: 1,
    padding: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  button: {
    minWidth: 120
  },
  editButton: {
    alignSelf: 'flex-end',
    marginBottom: 16
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold'
  },
  card: {
    marginBottom: 12,
    elevation: 2
  },
  noData: {
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.6
  }
});
