import { StyleSheet, Text, View } from "react-native";
import { Avatar } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function ProfileHeader() {
  const userObjStr = useSelector((state: RootState) => state.user.userData);
  const userData = userObjStr?.length ? JSON.parse(userObjStr) : null;

  return userData?.full_name && userData?.email ? (
    <View style={styles.container}>
      <Avatar.Image
        // style={styles.avatar}
        // rounded
        source={{
          uri: "https://tr.rbxcdn.com/63dc4f38b22fabffccefa6363a33dd06/420/420/Hat/Webp",
        }}
        size={24}
      />
      <View style={styles.textContainer}>
        <Text style={styles.text}>Name: {userData.full_name}</Text>
        <Text style={styles.text}>Email: {userData.email}</Text>
      </View>
    </View>
  ) : (
    <></>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textContainer: {
    display: "flex",
  },
  text: {
    fontSize: 18,
  },
});
