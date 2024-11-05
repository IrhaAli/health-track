import { router, Stack, Redirect, Slot } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getAuth } from "firebase/auth";
import { BottomNavigation, Text } from 'react-native-paper';
import { StatusBar, View } from 'react-native';
import { useSession } from '../../ctx';

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
const TrackRoute = () => < TrackScreen />;
const MediaRoute = () => <MediaScreen />;
const ProfileRoute = () => <ProfileScreen />;
// Routes.

export const unstable_settings = {
  initialRouteName: '(root)',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();
  const [index, setIndex] = React.useState(0);
  const dispatch = useDispatch<AppDispatch>();

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

  // Add loading state to prevent flash
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="displayLarge">Loading...</Text>
      </View>
    );
  }

  // Only redirect if we're definitely not logged in
  if (session === null) {
    return <Redirect href="/login" />;
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
