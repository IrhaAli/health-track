import { StyleSheet, View } from "react-native";
import { Avatar, Surface, Text, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import React from "react";

export default function ProfileHeader() {
  const userObjStr = useSelector((state: RootState) => state.user.userData);
  const userData = userObjStr?.length ? JSON.parse(userObjStr) : null;
  const theme = useTheme();

  return userData?.full_name && userData?.email ? (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.content}>
        <Avatar.Image
          source={{
            uri: "https://tr.rbxcdn.com/63dc4f38b22fabffccefa6363a33dd06/420/420/Hat/Webp",
          }}
          size={80}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.name}>
            {userData.full_name}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {userData.email}
          </Text>
        </View>
      </View>
    </Surface>
  ) : (
    <Surface style={styles.container} elevation={1}>
      <Text variant="bodyLarge">No user data available</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    width: "100%",
    marginTop: 25
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    opacity: 0.7,
  }
});
