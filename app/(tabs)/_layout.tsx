import { router, Tabs } from "expo-router";
import React from "react";
import { Stack } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getAuth } from "firebase/auth";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const userId = getAuth().currentUser?.uid;
  
  if (!userId) { router.push("/(signup)"); }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <Tabs screenOptions={{ tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint, headerShown: false }} >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (<TabBarIcon name={focused ? "home" : "home-outline"} color={color} />)
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: "Track",
            tabBarIcon: ({ color, focused }) => (<TabBarIcon name={focused ? "time" : "time-outline"} color={color} />)
          }}
        />
        <Tabs.Screen
          name="media"
          options={{
            title: "Media",
            tabBarIcon: ({ color, focused }) => (<TabBarIcon name={focused ? "bed" : "bed-outline"} color={color} />)
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (<TabBarIcon name={focused ? "fast-food" : "fast-food-outline"} color={color} />)
          }}
        />
      </Tabs>
    </>
  );
}
