import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { useEffect, useState } from "react";
import StressLevel from "@/components/user_info/StressLevel";
import { db } from "../../services/firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/services/i18n';
import { Appbar, Button, Surface, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

interface ProfileStressLevelProps {
  showNavigation?: boolean;
}

export default function ProfileStressLevel({ showNavigation = false }: ProfileStressLevelProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stressLevel, setStressLevel] = useState({
    docId: null,
    stressLevel: 0,
    notes: "",
  });
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
    <SafeAreaView style={styles.container}>
      {showNavigation && (
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.push('/profile')} />
          <Appbar.Content title={i18n.t('stressLevel')} style={{alignItems: 'center'}} />
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
            <StressLevel
              stressLevel={stressLevel}
              setStressLevel={setStressLevel}
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
              {i18n.t('stressLevel')}
            </Text>
            <View style={styles.infoContainer}>
              <Text variant="titleMedium" style={styles.label}>
                {i18n.t('stressLevel')}:
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {stressLevel.stressLevel}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text variant="titleMedium" style={styles.label}>
                {i18n.t('notes')}:
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {stressLevel.notes}
              </Text>
            </View>
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
  infoContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2
  },
  label: {
    marginBottom: 8,
    color: '#666'
  },
  value: {
    paddingLeft: 8
  }
});
