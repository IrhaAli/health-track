import { router, Stack, Redirect, Slot } from "expo-router";
import React from "react";
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

  if (isLoading) { return <View><Text variant="displayLarge">Loading...</Text></View> }
  if (!session) { console.log('redirecting to login'); return <Redirect href="/login" />; }

  return (
    <>
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? "light"].background}
        hidden={false} // Ensure the status bar is not hidden
      />
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        barStyle={{ backgroundColor: Colors[colorScheme ?? "light"].tint, marginBottom: -10 }}
      />
    </>
  );
}
