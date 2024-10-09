import { router, Stack } from "expo-router";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getAuth } from "firebase/auth";
import { BottomNavigation } from 'react-native-paper';
import { StatusBar } from 'react-native';

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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const userId = getAuth().currentUser?.uid;

  if (!userId) { router.push("/(signup)"); }

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? "light"].background}
        hidden={false} // Ensure the status bar is not hidden
      />
{/*   
      <Tabs screenOptions={{ tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint, headerShown: false }} >

        <Tabs.Screen name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (<TabBarIcon name={focused ? "home" : "home-outline"} color={color} />)
          }} />

        <Tabs.Screen name="track"
          options={{
            title: "Track",
            tabBarIcon: ({ color, focused }) => (<TabBarIcon name={focused ? "time" : "time-outline"} color={color} />)
          }} />

        <Tabs.Screen name="media"
          options={{
            title: "Media",
            tabBarIcon: ({ color, focused }) => (<TabBarIcon name={focused ? "bed" : "bed-outline"} color={color} />)
          }} />

        <Tabs.Screen name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (<TabBarIcon name={focused ? "fast-food" : "fast-food-outline"} color={color} />)
          }} />

      </Tabs> */}

      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        barStyle={{ backgroundColor: Colors[colorScheme ?? "light"].tint }}
      />
    </>
  );
}
