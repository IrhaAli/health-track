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
} from "react-native";
import { Link, useLocalSearchParams, router } from "expo-router";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as Notifications from "expo-notifications";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function DietaryPreferences() {
  const { uid } = useLocalSearchParams();
  // uid: uid || "vP24LQvbWTOvGtH3Mh68F2pdKBd2";

  return <Text>{uid}</Text>;
}

const styles = StyleSheet.create({});
