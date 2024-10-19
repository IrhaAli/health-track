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
import DietaryPreferences from "@/components/user_info/DietaryPreferences";
import { db } from "../../firebaseConfig";

export default function ProfileDietaryPreferences() {
  const uid =
    /* getAuth().currentUser?.uid || */ "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
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
  };
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
    getData();
  }, []);

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
          <DietaryPreferences
            dietaryPreferences={dietaryPreferences}
            setDietaryPreferences={setDietaryPreferences}
          />
        </>
      ) : (
        <>
          <View style={styles.buttonView}>
            <Pressable style={styles.button} onPress={() => setIsEdit(true)}>
              <Text style={styles.buttonText}>Edit</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Dietary Preferences</Text>
          {Object.keys(dietaryPreferences).map(
            (item: string, index: number) => {
              // Habib: Original Code by Irha.
              // if (dietaryPreferences[item] === true) {
              //   return (
              //     <Text key={index}>{dietaryPreferencesLabels[item]}</Text>
              //   );
              // }

              // Fixing validations error, if doesn't work, then use the above commented code.
              if (dietaryPreferences[item as keyof typeof dietaryPreferences] === true) {
                return (
                  <Text key={index}>{dietaryPreferencesLabels[item as keyof typeof dietaryPreferencesLabels]}</Text>
                );
              }
              return null; // Ensure a return value for all cases
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
