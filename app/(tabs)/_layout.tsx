import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "home" : "home-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="fast"
          options={{
            title: "Fast",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "time" : "time-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="food"
          options={{
            title: "Food",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "fast-food" : "fast-food-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="sleep"
          options={{
            title: "Sleep",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "bed" : "bed-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="water"
          options={{
            title: "Water",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "water" : "water-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="weight"
          options={{
            title: "Weight",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "scale" : "scale-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
