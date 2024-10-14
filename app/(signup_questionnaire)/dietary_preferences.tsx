import React, { useState } from "react";
import { StyleSheet, View, Pressable, Text, ScrollView } from "react-native";
import { useLocalSearchParams, router, Link } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import DietaryPreferences from "@/components/user_info/DietaryPreferences";
import { getAuth } from "firebase/auth";
interface dietaryPreferencesInterface {
  [key: string]: boolean;
}

export default function DietaryPreferencesPanel() {
  const auth = getAuth();
  const user_id = auth.currentUser?.uid;
  const [dietaryPreferences, setDietaryPreferences] =
    useState<dietaryPreferencesInterface>({
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

  const onSubmit = async () => {
    await addDoc(collection(db, "dietary_preferences"), {
      user_id,
      ...dietaryPreferences,
    });
    router.push("/(signup_questionnaire)/medical_history");
  };

  return (
    <ScrollView>
      <DietaryPreferences
        dietaryPreferences={dietaryPreferences}
        setDietaryPreferences={setDietaryPreferences}
      />
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>NEXT</Text>
        </Pressable>
      </View>
      <Link href={"/(signup_questionnaire)/medical_history"}>Skip</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
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
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
  },
});
