import { router, Stack, Redirect, Slot } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getAuth } from "firebase/auth";
import { BottomNavigation, Text } from 'react-native-paper';
import { StatusBar, View } from 'react-native';
import { useSession } from '../../ctx';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screen Imports Start. 
import HomeScreen from "./index";
import TrackScreen from "./track";
import MediaScreen from "./media";
import ProfileScreen from "./profile";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setCurrentDate, setCurrentMonth } from "@/store/trackSlice";
// Screen Imports End. 

// Routes.
const HomeRoute = () => <HomeScreen />;
const TrackRoute = () => <TrackScreen />;
const MediaRoute = () => <MediaScreen />;
const ProfileRoute = () => <ProfileScreen />;
// Routes.

export const unstable_settings = {
  initialRouteName: '(root)',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading, isFirstLaunch } = useSession();
  const [index, setIndex] = React.useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const [hasCheckedStorage, setHasCheckedStorage] = React.useState(false);
  const [shouldRedirect, setShouldRedirect] = React.useState<string | null>(null);

  useEffect(() => {
    const checkStorageState = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        const savedSession = await AsyncStorage.getItem('session');

        if (!language && !isFirstLaunch) {
          router.replace('/language');
        } else if (!savedSession && !session) {
          router.replace('/login');
        }
        setHasCheckedStorage(true);
      } catch (error) {
        console.error('Error checking storage state:', error);
        setHasCheckedStorage(true);
      }
    };

    checkStorageState();
  }, [session, isFirstLaunch]);

  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home' },
    { key: 'track', title: 'Track', focusedIcon: 'clock', unfocusedIcon: 'clock' },
    { key: 'media', title: 'Media', focusedIcon: 'image', unfocusedIcon: 'image' },
    { key: 'profile', title: 'Profile', focusedIcon: 'account', unfocusedIcon: 'account' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    track: TrackRoute,
    media: MediaRoute,
    profile: ProfileRoute,
  });

  // Wait for both loading states before rendering
  if (isLoading || !hasCheckedStorage) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="displayLarge">Loading...</Text>
      </View>
    );
  }

  // Check if user is authenticated
  if (!session) {
    return null; // Return null to prevent rendering while redirecting
  }

  const handleIndexChange = (newIndex: number) => {
    dispatch(setCurrentMonth({ month: String(new Date().getMonth() + 1).padStart(2, "0"), year: String(new Date().getFullYear()) }));
    dispatch(setCurrentDate(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`))
    setIndex(newIndex);
  };

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? "light"].background}
        hidden={false}
      />
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={handleIndexChange}
        renderScene={renderScene}
        barStyle={{ backgroundColor: Colors[colorScheme ?? "light"].tint, marginBottom: -10 }}
      />
    </>
  );
}
