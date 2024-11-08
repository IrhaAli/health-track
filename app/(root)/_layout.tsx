import { router, Stack, Redirect, Slot } from "expo-router";
import React, { useContext, useEffect, useMemo, useCallback } from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getAuth } from "firebase/auth";
import { BottomNavigation, Text } from 'react-native-paper';
import { StatusBar, View, Platform } from 'react-native';
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

  const routes = useMemo(() => [
    { key: 'home', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home' },
    { key: 'track', title: 'Track', focusedIcon: 'clock', unfocusedIcon: 'clock' },
    { key: 'media', title: 'Media', focusedIcon: 'image', unfocusedIcon: 'image' },
    { key: 'profile', title: 'Profile', focusedIcon: 'account', unfocusedIcon: 'account' },
  ], []);

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
  );
}
