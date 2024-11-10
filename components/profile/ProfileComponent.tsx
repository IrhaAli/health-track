import ProfileFooterLinks from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";
import { Button, Surface, useTheme } from "react-native-paper";
import { router } from "expo-router";
import ProfileContactForm from "./ProfileContactForm";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import { AppDispatch } from "@/store/store";
import { View, StyleSheet, ScrollView, InteractionManager } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/profile.json';

export default function ProfileComponent() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [t, setT] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    const initializeUserAndLanguage = async () => {
      try {
        // Get saved language first
        const language = await AsyncStorage.getItem('userLanguage');
        const effectiveLanguage = language || 'en';
        setCurrentLanguage(effectiveLanguage);
        setT(translations[effectiveLanguage as keyof typeof translations]);

        // Then get user data
        const userString = await AsyncStorage.getItem('session');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        // Fallback to English if there's an error
        setT(translations.en);
      }
    };

    initializeUserAndLanguage();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const languageListener = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language && language !== currentLanguage) {
          setCurrentLanguage(language);
          setT(translations[language as keyof typeof translations]);
        }
      } catch (error) {
        console.error('Error getting language:', error);
      }
    };

    const interval = setInterval(languageListener, 1000);
    return () => clearInterval(interval);
  }, [currentLanguage]);

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

  const menuItems = t ? [
    {
      title: t.backgroundInformation,
      icon: "account-details", 
      href: "/(profile)/background_information"
    },
    {
      title: t.dietaryPreferences.title,
      icon: "food-apple",
      href: "/(profile)/dietary_preferences"
    },
    {
      title: t.medicalHistory,
      icon: "medical-bag",
      href: "/(profile)/medical_history"
    },
    {
      title: t.stressLevel,
      icon: "brain",
      href: "/(profile)/stress_level"
    }
  ] : [];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const MemoizedMenuItems = useCallback(() => {
    if (!t) return null;
    
    return (
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <View key={index} style={styles.buttonWrapper}>
            <Button
              mode="text"
              icon={item.icon}
              contentStyle={[
                styles.buttonContent,
                currentLanguage === 'ar' && {flexDirection: 'row-reverse'}
              ]}
              style={[styles.menuButton]}
              labelStyle={[
                styles.buttonLabel,
                currentLanguage === 'ar' ? {marginRight: 24} : {marginLeft: 24},
                {textAlign: 'center'}
              ]}
              uppercase={false}
              rippleColor={theme.colors.primary}
              onPress={() => handleNavigation(item.href)}
            >
              {item.title}
            </Button>
          </View>
        ))}
      </View>
    );
  }, [theme.colors.primary, t]);

  if (!t) return null;

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
