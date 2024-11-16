import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { StyleSheet, View, SafeAreaView, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { db } from "../../services/firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/services/i18n';
import { Button, Switch, Text, Surface, Portal, Dialog, Paragraph, useTheme, Appbar, Card, Title } from 'react-native-paper';
import { router } from "expo-router";

interface ProfileDietaryPreferencesProps {
  showNavigation?: boolean;
}

export default function ProfileDietaryPreferences({ showNavigation = false }: ProfileDietaryPreferencesProps) {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState({
    docId: null,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_dairy_free: false,
    is_nut_free: false,
    is_seafood_allergic: false,
    is_low_carb: false,
    is_high_protein: false,
    is_low_fat: false,
    is_ketogenic: false,
    is_paleo: false,
    is_mediterranean: false,
    is_soy_allergic: false,
    is_egg_allergic: false,
    is_shellfish_allergic: false,
    is_fructose_intolerant: false,
    is_halal: false,
    is_spice_free: false,
    is_sugar_free: false,
    is_salt_free: false,
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
        docData.push({ docId: doc.id, ...doc.data() });
      });
      return collectionName === "medical_history" ? docData : docData[0];
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const dietaryInfo = await fetchData("dietary_preferences");
      setDietaryPreferences((({ user_id, ...o }) => o)(dietaryInfo));
    };
    if (currentUser) {
      getData();
    }
  }, [currentUser]);

  const onSubmit = async () => {
    setIsEdit(false);
    setIsDisabled(true);
    try {
      if (dietaryPreferences.docId) {
        const updateDietaryPreferencesDetails = doc(
          db,
          "dietary_preferences",
          dietaryPreferences.docId
        );
        await updateDoc(
          updateDietaryPreferencesDetails,
          (({ docId, ...o }) => o)(dietaryPreferences)
        );
        setShowDialog(true);
      }
    } catch (err) {
      console.log(err);
    }
    setIsDisabled(false);
  };

  const toggleSwitch = (key: string) => {
    setDietaryPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const PreferenceSwitch = ({ preference, label }: { preference: string, label: string }) => (
    <Surface style={styles.preferenceSurface} elevation={1}>
      <Text variant="bodyLarge">{label}</Text>
      <Switch
        value={dietaryPreferences[preference as keyof typeof dietaryPreferences] ?? false}
        onValueChange={() => toggleSwitch(preference)}
        disabled={!isEdit}
      />
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      {showNavigation && (
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.push('/profile')} />
          <Appbar.Content 
            title={i18n.t('dietaryPreferences.title')} 
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

              <View style={styles.preferencesGrid}>
                <PreferenceSwitch preference="is_vegetarian" label={i18n.t('dietaryPreferences.is_vegetarian')} />
                <PreferenceSwitch preference="is_vegan" label={i18n.t('dietaryPreferences.is_vegan')} />
                <PreferenceSwitch preference="is_gluten_free" label={i18n.t('dietaryPreferences.is_gluten_free')} />
                <PreferenceSwitch preference="is_dairy_free" label={i18n.t('dietaryPreferences.is_dairy_free')} />
                <PreferenceSwitch preference="is_nut_free" label={i18n.t('dietaryPreferences.is_nut_free')} />
                <PreferenceSwitch preference="is_seafood_allergic" label={i18n.t('dietaryPreferences.is_seafood_allergic')} />
                <PreferenceSwitch preference="is_low_carb" label={i18n.t('dietaryPreferences.is_low_carb')} />
                <PreferenceSwitch preference="is_high_protein" label={i18n.t('dietaryPreferences.is_high_protein')} />
                <PreferenceSwitch preference="is_low_fat" label={i18n.t('dietaryPreferences.is_low_fat')} />
                <PreferenceSwitch preference="is_ketogenic" label={i18n.t('dietaryPreferences.is_ketogenic')} />
                <PreferenceSwitch preference="is_paleo" label={i18n.t('dietaryPreferences.is_paleo')} />
                <PreferenceSwitch preference="is_mediterranean" label={i18n.t('dietaryPreferences.is_mediterranean')} />
                <PreferenceSwitch preference="is_soy_allergic" label={i18n.t('dietaryPreferences.is_soy_allergic')} />
                <PreferenceSwitch preference="is_egg_allergic" label={i18n.t('dietaryPreferences.is_egg_allergic')} />
                <PreferenceSwitch preference="is_shellfish_allergic" label={i18n.t('dietaryPreferences.is_shellfish_allergic')} />
                <PreferenceSwitch preference="is_fructose_intolerant" label={i18n.t('dietaryPreferences.is_fructose_intolerant')} />
                <PreferenceSwitch preference="is_halal" label={i18n.t('dietaryPreferences.is_halal')} />
                <PreferenceSwitch preference="is_spice_free" label={i18n.t('dietaryPreferences.is_spice_free')} />
                <PreferenceSwitch preference="is_sugar_free" label={i18n.t('dietaryPreferences.is_sugar_free')} />
                <PreferenceSwitch preference="is_salt_free" label={i18n.t('dietaryPreferences.is_salt_free')} />
              </View>
            </>
          ) : (
            <>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.titleContainer}>
                    <Title style={styles.title}>{i18n.t('dietaryPreferences.title')}</Title>
                    <Button
                      mode="contained"
                      onPress={() => setIsEdit(true)}
                      style={styles.editButton}
                      icon="pencil"
                    >
                      {i18n.t('edit')}
                    </Button>
                  </View>
                  {Object.entries(dietaryPreferences)
                    .filter(([key]) => key !== 'docId')
                    .map(([key, value]) => (
                      <View key={key} style={styles.infoRow}>
                        <Text style={styles.label}>
                          {i18n.t(`dietaryPreferences.${key}`)}:
                        </Text>
                        <Text style={{
                          color: value ? theme.colors.primary : theme.colors.error
                        }}>
                          {value ? 'Yes' : 'No'}
                        </Text>
                      </View>
                    ))
                  }
                </Card.Content>
              </Card>
            </>
          )}

          <Portal>
            <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
              <Dialog.Title>Success</Dialog.Title>
              <Dialog.Content>
                <Paragraph>Your dietary preferences have been updated successfully!</Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowDialog(false)}>OK</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
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
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
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
    marginBottom: 16,
    borderRadius: 20,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
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
  },
  preferencesGrid: {
    gap: 12
  },
  preferenceSurface: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
});