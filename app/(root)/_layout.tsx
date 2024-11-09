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
  const [currentLanguage, setCurrentLanguage] = React.useState<string>('en');
  const [isLanguageLoaded, setIsLanguageLoaded] = React.useState(false);

  // Initialize language once on mount
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error getting language:', error);
      } finally {
        setIsLanguageLoaded(true);
      }
    };
    initLanguage();
  }, []);

  const t = useMemo(() => {
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  }, [currentLanguage]);

  const routes = useMemo(() => [
    { key: 'home', title: t.home, focusedIcon: 'home', unfocusedIcon: 'home' },
    { key: 'track', title: t.track, focusedIcon: 'clock', unfocusedIcon: 'clock' },
    { key: 'media', title: t.media, focusedIcon: 'image', unfocusedIcon: 'image' },
    { key: 'profile', title: t.profile, focusedIcon: 'account', unfocusedIcon: 'account' },
  ], [t]);

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
    setIndex(newIndex);
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

  if (!isLanguageLoaded) {
    return null;
  }

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
