import React from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Switch,
} from "react-native";
import { Link } from "expo-router";

type DietaryPreferencesLabels = {
  [key: string]: string;
  is_vegetarian: string;
  is_vegan: string;
  is_gluten_free: string;
  is_dairy_free: string;
  is_nut_free: string;
  is_seafood_allergic: string;
  is_low_carb: string;
  is_high_protein: string;
  is_low_fat: string;
  is_ketogenic: string;
  is_paleo: string;
  is_mediterranean: string;
  is_soy_allergic: string;
  is_egg_allergic: string;
  is_shellfish_allergic: string;
  is_fructose_intolerant: string;
  is_halal: string;
  is_spice_free: string;
  is_sugar_free: string;
  is_salt_free: string;
};

export default function DietaryPreferences({
  dietaryPreferences,
  setDietaryPreferences,
}: any) {
  const toggleSwitch = (toggleType: string) =>
    setDietaryPreferences((prev: any) => ({
      ...prev,
      [toggleType]: !prev[toggleType],
    }));

  const dietaryPreferencesLabels: DietaryPreferencesLabels = {
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dietary Preferences</Text>
      <View style={styles.inputView}>
        {Object.keys(dietaryPreferencesLabels).map(
          (item: string, index: number) => {
            return (
              <View key={index}>
                <Text>{dietaryPreferencesLabels[item]}</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={dietaryPreferences[item] ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => toggleSwitch(item)}
                  value={dietaryPreferences[item]}
                />
              </View>
            );
          }
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 70,
  },
  image: {
    height: 160,
    width: 170,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 7,
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
  icons: {
    width: 40,
    height: 40,
  },
  signup: {
    color: "red",
    fontSize: 13,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
});
