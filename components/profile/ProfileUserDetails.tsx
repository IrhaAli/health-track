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
import UserDetails from "@/components/user_info/UserDetails";
import { db } from "../../services/firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/services/i18n';
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { 
  Button,
  Text,
  Surface,
  Portal,
  Card,
  Title,
  Paragraph,
  Appbar,
  useTheme,
  IconButton
} from 'react-native-paper';

interface ProfileUserDetailsProps {
  showNavigation?: boolean;
}

export default function ProfileUserDetails({ showNavigation = false }: ProfileUserDetailsProps) {
  const theme = useTheme();
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
    <SafeAreaView style={styles.container}>
      {showNavigation && (
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.push('/profile')} />
          <Appbar.Content 
            title={i18n.t('backgroundInformation')} 
            style={{
              alignItems: 'center',
              position: 'absolute',
              left: 0,
              right: 0
            }} 
          />
        </Appbar.Header>
      )}
      <View style={styles.content}>
        {isEdit ? (
          <>
            <Surface style={styles.buttonView} elevation={1}>
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
                style={styles.button}
              >
                {i18n.t('cancel')}
              </Button>
            </Surface>
            <UserDetails
              userDetails={userDetails}
              setUserDetails={setUserDetails}
              isSignUpPage={false}
            />
          </>
        ) : (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.titleContainer}>
                  <Title style={styles.title}>{i18n.t('backgroundInformation')}</Title>
                  <Button
                    mode="contained"
                    onPress={() => setIsEdit(true)}
                    style={styles.editButton}
                    icon="pencil"
                  >
                    {i18n.t('edit')}
                  </Button>
                </View>
                
                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('dateOfBirth')}:</Paragraph>
                  <Text>{userDetails.dob ? userDetails.dob.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('gender')}:</Paragraph>
                  <Text>{userDetails.gender ? userDetails.gender.charAt(0).toUpperCase() + userDetails.gender.slice(1) : ''}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('height')}:</Paragraph>
                  <Text>{userDetails.height}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('weight')}:</Paragraph>
                  <Text>{userDetails.weight}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('bodyType')}:</Paragraph>
                  <Text>{userDetails.bodyType ? userDetails.bodyType.charAt(0).toUpperCase() + userDetails.bodyType.slice(1) : ''}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('activityType')}:</Paragraph>
                  <Text>{userDetails.activityType ? userDetails.activityType.charAt(0).toUpperCase() + userDetails.activityType.slice(1) : ''}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('wakeupTime')}:</Paragraph>
                  <Text>{userDetails.wakeupTime ? userDetails.wakeupTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : ''}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('sleepTime')}:</Paragraph>
                  <Text>{userDetails.sleepTime ? userDetails.sleepTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : ''}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>{i18n.t('healthGoal')}:</Paragraph>
                  <Text>{userDetails.healthGoal ? userDetails.healthGoal.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''}</Text>
                </View>
              </Card.Content>
            </Card>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  buttonView: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    marginVertical: 5,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  editButton: {
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontWeight: '600',
    color: '#666',
  }
});