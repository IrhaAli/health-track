import { router, Stack, Redirect, Slot } from "expo-router";
import React, { useContext, useEffect, useMemo, useCallback } from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BottomNavigation, Text } from 'react-native-paper';
import { StatusBar, View, Platform } from 'react-native';
import { useSession } from '../../ctx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/layout.json';

// Screen Imports Start.
import HomeScreen from "./index";
import TrackScreen from "./track";
import MediaScreen from "./media";
import ProfileScreen from "./profile";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setCurrentDate, setCurrentMonth } from "@/store/trackSlice";
// Screen Imports End.

// Pre-load all screens to avoid lazy loading delays
const MemoizedHomeScreen = React.memo(HomeScreen);
const MemoizedTrackScreen = React.memo(TrackScreen);
const MemoizedMediaScreen = React.memo(MediaScreen);
const MemoizedProfileScreen = React.memo(ProfileScreen);

export const unstable_settings = {
  initialRouteName: '(root)',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useSession();
  const [index, setIndex] = React.useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const [currentLanguage, setCurrentLanguage] = React.useState("en");

  // Add language change listener
  useEffect(() => {
    const getLanguage = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language) {
          setCurrentLanguage(language);
        }
      } catch (error) {
        console.error('Error getting language:', error);
      }
    };
    getLanguage();

    // Poll for language changes instead of using addListener
    const interval = setInterval(async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        if (language && language !== currentLanguage) {
          setCurrentLanguage(language);
        }
      } catch (error) {
        console.error('Error checking language:', error);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentLanguage]);

  const t = translations[currentLanguage as keyof typeof translations];

  const baseRoutes = [
    { key: 'home', title: t.home, focusedIcon: 'home', unfocusedIcon: 'home' },
    { key: 'track', title: t.track, focusedIcon: 'clock', unfocusedIcon: 'clock' },
    { key: 'media', title: t.media, focusedIcon: 'image', unfocusedIcon: 'image' },
    { key: 'profile', title: t.profile, focusedIcon: 'account', unfocusedIcon: 'account' },
  ];

  const routes = useMemo(() => {
    return currentLanguage === 'ar' ? [...baseRoutes].reverse() : baseRoutes;
  }, [t, currentLanguage]);

  // Pre-render all scenes to avoid lazy loading
  const scenes = useMemo(() => ({
    home: MemoizedHomeScreen,
    track: MemoizedTrackScreen,
    media: MemoizedMediaScreen,
    profile: MemoizedProfileScreen,
  }), []);

  const renderScene = useCallback(({ route }: { route: { key: string } }) => {
    const Scene = scenes[route.key as keyof typeof scenes];
    return <Scene />;
  }, [scenes]);

  const handleIndexChange = useCallback((newIndex: number) => {
    // Update index immediately for UI responsiveness
    setIndex(newIndex);

    // Handle date updates in the next tick to prioritize navigation
    setTimeout(() => {
      const now = new Date();
      dispatch(setCurrentMonth({
        month: String(now.getMonth() + 1).padStart(2, "0"),
        year: String(now.getFullYear())
      }));
      dispatch(setCurrentDate(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      ));
    }, 0);
  }, [dispatch]);

  return (
    <>
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={Colors[colorScheme ?? "light"].background}
          hidden={false}
        />
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={handleIndexChange}
          renderScene={renderScene}
          barStyle={Platform.select({
            ios: {
              backgroundColor: Colors[colorScheme ?? "light"].tint,
              marginBottom: -10
            },
            android: {
              backgroundColor: Colors[colorScheme ?? "light"].tint,
              marginBottom: -10,
              elevation: 8
            }
          })}
          sceneAnimationEnabled={true}
          shifting={false}
        />
      </View>
    </>
  );
}
