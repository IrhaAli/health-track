import { Stack } from "expo-router";
import React from "react";
import { Colors } from "@/app/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'react-native';
import { useSession } from '../../ctx';
import { BottomTabBar } from "@/components/bottomNavigation";

// Screen Imports Start.
import HomeScreen from "./index";
import TrackScreen from "./track";
import MediaScreen from "./media";
import ProfileScreen from "./profile";
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

  // Pre-render all scenes to avoid lazy loading
  const scenes = React.useMemo(() => ({
    home: MemoizedHomeScreen,
    track: MemoizedTrackScreen,
    media: MemoizedMediaScreen,
    profile: MemoizedProfileScreen,
  }), []);

  // Map index to scene key
  const sceneKeys = ['home', 'track', 'media', 'profile'];
  const CurrentScene = scenes[sceneKeys[index] as keyof typeof scenes];

  return (
    <>
      <View style={styles.container}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={Colors[colorScheme ?? "light"].background}
          hidden={false}
        />

        <View style={styles.sceneContainer}>
          <CurrentScene />
        </View>

        <BottomTabBar onIndexChange={setIndex} currentIndex={index} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sceneContainer: {
    flex: 1,
    marginBottom: 60,
  }
});
