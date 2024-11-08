import ProfileFooterLinks from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";
import { Button, Surface, useTheme } from "react-native-paper";
import { Link } from "expo-router";
import ProfileContactForm from "./ProfileContactForm";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import { AppDispatch } from "@/store/store";
import { View, StyleSheet, ScrollView } from "react-native";
import React, { useEffect } from "react";

export default function ProfileComponent() {
  const auth = getAuth();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const getUserData = async () => {
    try {
      const collectionData = query(
        collection(db, "users"),
        where("user_id", "==", auth.currentUser?.uid)
      );
      const querySnapshot = await getDocs(collectionData);
      let docData: any[] = [];
      querySnapshot.forEach((doc) => {
        docData.push({ id: doc.id, ...doc.data() });
      });

      const userInfo = docData[0];
      if (userInfo) {
        dispatch(setUser(JSON.stringify(userInfo)));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (auth.currentUser?.uid) {
      getUserData();
    }
  }, [auth.currentUser]);

  const menuItems = [
    {
      title: "Background Information",
      icon: "account-details", 
      href: "/(profile)/background_information"
    },
    {
      title: "Dietary Preferences",
      icon: "food-apple",
      href: "/(profile)/dietary_preferences"
    },
    {
      title: "Medical History",
      icon: "medical-bag",
      href: "/(profile)/medical_history"
    },
    {
      title: "Stress Level",
      icon: "brain",
      href: "/(profile)/stress_level"
    }
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <Surface style={styles.container}>
        <View style={styles.headerContainer}>
          <ProfileHeader />
        </View>
        
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} style={styles.menuLink}>
              <Button
                mode="text"
                icon={item.icon}
                contentStyle={styles.buttonContent}
                style={styles.menuButton}
                labelStyle={styles.buttonLabel}
                uppercase={false}
                rippleColor={theme.colors.primary}
              >
                {item.title}
              </Button>
            </Link>
          ))}
        </View>

        <View style={styles.formContainer}>
          <ProfileContactForm />
        </View>
        
        <View style={styles.footerContainer}>
          <ProfileFooterLinks />
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    alignItems: 'center'
  },
  headerContainer: {
    width: '100%',
    marginBottom: 20
  },
  menuContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 12
  },
  menuLink: {
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
    alignSelf: 'center'
  },
  menuButton: {
    borderRadius: 12,
    height: 56,
    width: '100%',
    maxWidth: 400,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignSelf: 'center'
  },
  buttonContent: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 20
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'left',
    marginLeft: 24,
    color: '#333'
  },
  formContainer: {
    width: '100%',
    marginBottom: 20
  },
  footerContainer: {
    width: '100%'
  }
});
