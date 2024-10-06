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
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function DietaryPreferences({
  dietaryPreferences,
  setDietaryPreferences,
}: any) {
  const toggleSwitch = (toggleType: string) =>
    setDietaryPreferences((prev: any) => ({
      ...prev,
      [toggleType]: !prev[toggleType],
    }));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dietary Preferences</Text>
      <View style={styles.inputView}>
        <Text>Vegetarian</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_vegetarian ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_vegetarian")}
          value={dietaryPreferences.is_vegetarian}
        />
        <Text>Vegan</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_vegan ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_vegan")}
          value={dietaryPreferences.is_vegan}
        />
        <Text>Gluten Free</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_gluten_free ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_gluten_free")}
          value={dietaryPreferences.is_gluten_free}
        />
        <Text>Dairy Free</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_dairy_free ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_dairy_free")}
          value={dietaryPreferences.is_dairy_free}
        />
        <Text>Nut Free</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_nut_free ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_nut_free")}
          value={dietaryPreferences.is_nut_free}
        />
        <Text>Seafod Allergic</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={
            dietaryPreferences.is_seafod_allergic ? "#f5dd4b" : "#f4f3f4"
          }
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_seafod_allergic")}
          value={dietaryPreferences.is_seafod_allergic}
        />
        <Text>Low Carb</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_low_carb ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_low_carb")}
          value={dietaryPreferences.is_low_carb}
        />
        <Text>High Protein</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={
            dietaryPreferences.is_high_protein ? "#f5dd4b" : "#f4f3f4"
          }
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_high_protein")}
          value={dietaryPreferences.is_high_protein}
        />
        <Text>Low Fat</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_low_fat ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_low_fat")}
          value={dietaryPreferences.is_low_fat}
        />
        <Text>Ketogenic</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_ketogenic ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_ketogenic")}
          value={dietaryPreferences.is_ketogenic}
        />
        <Text>Paleo</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_paleo ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_paleo")}
          value={dietaryPreferences.is_paleo}
        />
        <Text>Mediterranean</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={
            dietaryPreferences.is_mediterranean ? "#f5dd4b" : "#f4f3f4"
          }
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_mediterranean")}
          value={dietaryPreferences.is_mediterranean}
        />
        <Text>Soy Allergic</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={
            dietaryPreferences.is_soy_allergic ? "#f5dd4b" : "#f4f3f4"
          }
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_soy_allergic")}
          value={dietaryPreferences.is_soy_allergic}
        />
        <Text>Egg Allergic</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={
            dietaryPreferences.is_egg_allergic ? "#f5dd4b" : "#f4f3f4"
          }
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_egg_allergic")}
          value={dietaryPreferences.is_egg_allergic}
        />
        <Text>Shellfish Allergic</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={
            dietaryPreferences.is_shellfish_allergic ? "#f5dd4b" : "#f4f3f4"
          }
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_shellfish_allergic")}
          value={dietaryPreferences.is_shellfish_allergic}
        />
        <Text>Fructose Intolerant</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={
            dietaryPreferences.is_fructose_intolerant ? "#f5dd4b" : "#f4f3f4"
          }
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_fructose_intolerant")}
          value={dietaryPreferences.is_fructose_intolerant}
        />
        <Text>Halal</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_halal ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_halal")}
          value={dietaryPreferences.is_halal}
        />
        <Text>Spice Free</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_spice_free ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_spice_free")}
          value={dietaryPreferences.is_spice_free}
        />
        <Text>Sugar Free</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_sugar_free ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_sugar_free")}
          value={dietaryPreferences.is_sugar_free}
        />
        <Text>Salt Free</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dietaryPreferences.is_salt_free ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch("is_salt_free")}
          value={dietaryPreferences.is_salt_free}
        />
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
