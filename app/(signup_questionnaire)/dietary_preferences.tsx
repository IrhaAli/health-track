import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Image,
  Switch,
} from "react-native";
import { Link, useLocalSearchParams, router } from "expo-router";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as Notifications from "expo-notifications";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import DietaryPreferences from "@/components/user_info/DietaryPreferences";

interface dietaryPreferencesInterface {
  [key: string]: boolean;
}

export default function DietaryPreferencesPanel() {
  const { uid } = useLocalSearchParams();
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
      user_id: uid,
      ...dietaryPreferences,
    });
    router.push({
      pathname: "/(signup_questionnaire)/medical_history",
      params: { uid },
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/home-image.png")}
          style={styles.appLogo}
        />
      }
    >
      <DietaryPreferences
        dietaryPreferences={dietaryPreferences}
        setDietaryPreferences={setDietaryPreferences}
        onSubmit={onSubmit}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
});
