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
import { Button, Switch, Text, Surface, Portal, Dialog, Paragraph, useTheme } from 'react-native-paper';

export default function ProfileDietaryPreferences() {
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.mainSurface} elevation={2}>
          <Text variant="headlineMedium" style={styles.title}>
            {i18n.t('dietaryPreferences.title')}
          </Text>

          {isEdit ? (
            <>
              <View style={styles.buttonContainer}>
                <Button 
                  mode="contained" 
                  onPress={onSubmit}
                  disabled={isDisabled}
                  style={styles.actionButton}
                >
                  {i18n.t('profile.submit')}
                </Button>
                <Button 
                  mode="outlined"
                  onPress={() => setIsEdit(false)}
                  style={styles.actionButton}
                >
                  {i18n.t('profile.cancel')}
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
              <Button 
                mode="contained"
                onPress={() => setIsEdit(true)}
                style={styles.editButton}
              >
                {i18n.t('edit')}
              </Button>

              <Surface style={styles.preferencesListSurface} elevation={1}>
                {Object.entries(dietaryPreferences)
                  .filter(([key]) => key !== 'docId')
                  .map(([key, value]) => (
                    <View key={key} style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 4
                    }}>
                      <Text variant="bodyLarge" style={styles.preferenceItem}>
                        • {i18n.t(`dietaryPreferences.${key}`)}
                      </Text>
                      <Text variant="bodyLarge" style={{
                        fontWeight: '500',
                        color: value ? theme.colors.primary : theme.colors.error
                      }}>
                        {value ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  ))
                }
              </Surface>
            </>
          )}
        </Surface>
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1
  },
  mainSurface: {
    padding: 16,
    borderRadius: 8
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24
  },
  actionButton: {
    minWidth: 120
  },
  editButton: {
    marginBottom: 16,
    borderRadius: 8
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
  preferencesListSurface: {
    padding: 16,
    borderRadius: 8
  },
  preferenceItem: {
    paddingVertical: 4
  }
});