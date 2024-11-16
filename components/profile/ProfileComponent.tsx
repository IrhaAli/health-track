import ProfileFooterLinks from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";
import { Button, Surface, useTheme } from "react-native-paper";
import { router } from "expo-router";
import ProfileContactForm from "./ProfileContactForm";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import { AppDispatch } from "@/store/store";
import { View, StyleSheet, ScrollView, InteractionManager } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/services/i18n';

export default function ProfileComponent() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
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

    initializeUser();
  }, []);

  const getUserData = async () => {
    try {
      const collectionData = query(
        collection(db, "users"),
        where("user_id", "==", currentUser?.uid)
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
    if (currentUser?.uid) {
      getUserData();
    }
  }, [currentUser]);

  const menuItems = [
    {
      title: i18n.t('backgroundInformation'),
      icon: "account-details",
      href: "/(profile)/background_information"
    },
    {
      title: i18n.t('dietaryPreferences.title'),
      icon: "food-apple",
      href: "/(profile)/dietary_preferences"
    },
    {
      title: i18n.t('medicalHistory'),
      icon: "medical-bag",
      href: "/(profile)/medical_history"
    },
    {
      title: i18n.t('stressLevel'),
      icon: "brain",
      href: "/(profile)/stress_level"
    }
  ];
  const handleNavigation = (href: "/(profile)/background_information" | "/(profile)/dietary_preferences" | "/(profile)/medical_history" | "/(profile)/stress_level") => {
    router.push(href);
  };

  const MemoizedMenuItems = useCallback(() => {
    return (
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <View key={index} style={styles.buttonWrapper}>
            <Button
              mode="text"
              icon={item.icon}
              contentStyle={styles.buttonContent}
              style={styles.menuButton}
              labelStyle={styles.buttonLabel}
              uppercase={false}
              rippleColor={theme.colors.primary}
              onPress={() => handleNavigation(item.href as "/(profile)/background_information" | "/(profile)/dietary_preferences" | "/(profile)/medical_history" | "/(profile)/stress_level")}
            >
              {item.title}
            </Button>
          </View>
        ))}
      </View>
    );
  }, [theme.colors.primary]);

  return (
    <ScrollView style={styles.scrollView}>
      <Surface style={styles.container}>
        <View style={styles.headerContainer}>
          <ProfileHeader />
        </View>
        
        {isReady && <MemoizedMenuItems />}

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
    marginBottom: 12
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12
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
    justifyContent: 'center'
  },
  buttonContent: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center'
  },
  formContainer: {
    width: '100%',
    marginBottom: 20
  },
  footerContainer: {
    width: '100%'
  }
});
