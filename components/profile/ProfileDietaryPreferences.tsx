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
import DietaryPreferences from "@/components/user_info/DietaryPreferences";
import { db } from "../../services/firebaseConfig";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/profile.json';

export default function ProfileDietaryPreferences() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [t, setT] = useState<any>(null);
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

  const dietaryPreferencesLabels = {
    en: {
      is_vegetarian: "Vegetarian",
      is_vegan: "Vegan", 
      is_gluten_free: "Gluten Free",
      is_dairy_free: "Dairy Free/Lactose Intolerant",
      is_nut_free: "Nut Free",
      is_seafood_allergic: "Seafood Allergy",
      is_low_carb: "Low Carb",
      is_high_protein: "High Protein", 
      is_low_fat: "Low Fat",
      is_ketogenic: "Ketogenic",
      is_paleo: "Paleo",
      is_mediterranean: "Mediterranean",
      is_soy_allergic: "Soy Allergy",
      is_egg_allergic: "Egg Allergy",
      is_shellfish_allergic: "Shellfish Allergy",
      is_fructose_intolerant: "Fructose Intolerant",
      is_halal: "Halal",
      is_spice_free: "Spice Free",
      is_sugar_free: "Sugar Free",
      is_salt_free: "Salt Free",
      submit: "Submit",
      cancel: "Cancel",
      edit: "Edit",
      title: "Dietary Preferences"
    },
    fr: {
      is_vegetarian: "Végétarien",
      is_vegan: "Végétalien",
      is_gluten_free: "Sans Gluten",
      is_dairy_free: "Sans Lactose",
      is_nut_free: "Sans Noix",
      is_seafood_allergic: "Allergie aux Fruits de Mer",
      is_low_carb: "Faible en Glucides",
      is_high_protein: "Riche en Protéines",
      is_low_fat: "Faible en Gras",
      is_ketogenic: "Cétogène",
      is_paleo: "Paléo",
      is_mediterranean: "Méditerranéen",
      is_soy_allergic: "Allergie au Soja",
      is_egg_allergic: "Allergie aux Œufs",
      is_shellfish_allergic: "Allergie aux Crustacés",
      is_fructose_intolerant: "Intolérance au Fructose",
      is_halal: "Halal",
      is_spice_free: "Sans Épices",
      is_sugar_free: "Sans Sucre",
      is_salt_free: "Sans Sel",
      submit: "Soumettre",
      cancel: "Annuler",
      edit: "Modifier",
      title: "Préférences Alimentaires"
    },
    ar: {
      is_vegetarian: "نباتي",
      is_vegan: "نباتي صارم",
      is_gluten_free: "خالي من الغلوتين",
      is_dairy_free: "خالي من منتجات الألبان",
      is_nut_free: "خالي من المكسرات",
      is_seafood_allergic: "حساسية من المأكولات البحرية",
      is_low_carb: "قليل الكربوهيدرات",
      is_high_protein: "عالي البروتين",
      is_low_fat: "قليل الدهون",
      is_ketogenic: "كيتوجيني",
      is_paleo: "باليو",
      is_mediterranean: "متوسطي",
      is_soy_allergic: "حساسية من الصويا",
      is_egg_allergic: "حساسية من البيض",
      is_shellfish_allergic: "حساسية من المحار",
      is_fructose_intolerant: "عدم تحمل الفركتوز",
      is_halal: "حلال",
      is_spice_free: "خالي من التوابل",
      is_sugar_free: "خالي من السكر",
      is_salt_free: "خالي من الملح",
      submit: "إرسال",
      cancel: "إلغاء",
      edit: "تعديل",
      title: "التفضيلات الغذائية"
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // Get language first
        const language = await AsyncStorage.getItem('userLanguage');
        const effectiveLanguage = language || 'en';
        setCurrentLanguage(effectiveLanguage);
        setT(dietaryPreferencesLabels[effectiveLanguage as keyof typeof dietaryPreferencesLabels]);

        // Then get user
        const userString = await AsyncStorage.getItem('session');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        // Fallback to English
        setCurrentLanguage('en');
        setT(dietaryPreferencesLabels.en);
      }
    };

    initialize();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const languageListener = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language && language !== currentLanguage) {
          setCurrentLanguage(language);
          setT(dietaryPreferencesLabels[language as keyof typeof dietaryPreferencesLabels]);
        }
      } catch (error) {
        console.error('Error getting language:', error);
      }
    };

    const interval = setInterval(languageListener, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage]);

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
      }
    } catch (err) {
      console.log(err);
    }
    setIsDisabled(false);
  };

  if (!t) return null; // Wait for translations to load

  return (
    <>
      {isEdit ? (
        <>
          <View
            style={styles.buttonView}
            pointerEvents={isDisabled ? "none" : "auto"}
          >
            <Pressable style={styles.button} onPress={onSubmit}>
              <Text style={styles.buttonText}>{t.submit}</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => setIsEdit(false)}>
              <Text style={styles.buttonText}>{t.cancel}</Text>
            </Pressable>
          </View>
          <DietaryPreferences
            dietaryPreferences={dietaryPreferences}
            setDietaryPreferences={setDietaryPreferences}
          />
        </>
      ) : (
        <>
          <View style={styles.buttonView}>
            <Pressable style={styles.button} onPress={() => setIsEdit(true)}>
              <Text style={styles.buttonText}>{t.edit}</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>{t.title}</Text>
          {Object.keys(dietaryPreferences).map(
            (item: string, index: number) => {
              if (dietaryPreferences[item as keyof typeof dietaryPreferences] === true) {
                return (
                  <Text key={index}>{t[item as keyof typeof t]}</Text>
                );
              }
              return null;
            }
          )}
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