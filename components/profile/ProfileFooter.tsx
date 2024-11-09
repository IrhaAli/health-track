import { Linking, StyleSheet, View } from "react-native";
import AlertAsync from "react-native-alert-async";
import { Button, Surface, Text, useTheme, Divider } from "react-native-paper";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser, setUserId } from "@/store/userSlice";
import { useSession } from "@/ctx";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileFooterLinks() {
  const userObjStr = useSelector((state: RootState) => state.user.userData);
  const userData = userObjStr?.length ? JSON.parse(userObjStr) : null;
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { signOut } = useSession();

  useEffect(() => {
    const getUser = async () => {
      const userString = await AsyncStorage.getItem('session');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user);
      }
    };
    getUser();
  }, []);

  const onLogout = () => {
    dispatch(setUser(null));
    dispatch(setUserId(null));
    signOut();
  };

  const onAccountDelete = async () => {
    const choice = await AlertAsync(
      "Are you sure you want to delete your account?",
      "Your Account will be deleted permanently",
      [
        { text: "Yes", onPress: () => true },
        { text: "No", onPress: () => false },
      ]
    );

    if (!choice) return;

    try {
      const deleteAccount = doc(db, "users", userData.id);
      await updateDoc(deleteAccount, {
        is_deleted: true,
      }).then(() => currentUser.delete());
    } catch (error) {
      console.log("error in delete account", error);
    }

    onLogout();
  };

  return (
    <Surface style={styles.container} elevation={1}>
      <Button
        mode="contained"
        onPress={onLogout}
        style={styles.logoutButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        icon="logout"
      >
        Logout
      </Button>

      <Divider style={styles.divider} />

      <View style={styles.links}>
        <Button
          mode="text"
          onPress={onAccountDelete}
          textColor={theme.colors.error}
          icon="account-remove"
          style={styles.linkButton}
        >
          Delete My Account
        </Button>

        <Button
          mode="text"
          onPress={() => Linking.openURL("https://google.com")}
          icon="shield-account"
          style={styles.linkButton}
        >
          Privacy Policy
        </Button>

        <Button
          mode="text"
          onPress={() => Linking.openURL("https://google.com")}
          icon="file-document"
          style={styles.linkButton}
        >
          Terms and Conditions
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  logoutButton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    letterSpacing: 1,
  },
  divider: {
    marginVertical: 16,
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  linkButton: {
    justifyContent: "flex-start",
  }
});
