import { getAuth } from "firebase/auth";
import {
  StyleSheet,
  View,
  Text,
  Linking,
  TouchableOpacity,
} from "react-native";
import AlertAsync from "react-native-alert-async";
import { Button } from "react-native-paper";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser, setUserId } from "@/store/userSlice";
import { useSession } from "@/ctx";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function ProfileFooterLinks() {
  const userObjStr = useSelector((state: RootState) => state.user.userData);
  const userData = userObjStr?.length ? JSON.parse(userObjStr) : null;

  const dispatch = useDispatch();
  const { signOut } = useSession();
  const auth = getAuth();

  const onLogout = () => {
    dispatch(setUser(null));
    dispatch(setUserId(null));
    signOut();
  };

  const onAccountDelete = async () => {
    const choice = await AlertAsync(
      "Are you sure you want to delete your account?",
      "Your Account will be deleted permanently",
      [
        { text: "Yes", onPress: () => true },
        { text: "No", onPress: () => false },
      ]
    );

    if (!choice) return;

    const user: any = auth.currentUser;
    try {
      const deleteAccount = doc(db, "users", userData.id);
      await updateDoc(deleteAccount, {
        is_deleted: true,
      }).then(() => user.delete());
    } catch (error) {
      console.log("error in delete account", error);
    }

    onLogout();
  };

  return (
    <>
      <Button mode="contained" onPress={onLogout}>
        Logout
      </Button>
      <View style={styles.links}>
        <Text style={styles.buttonTextRed} onPress={onAccountDelete}>
          Delete My Account
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL("https://google.com")}>
          <Text style={styles.buttonTextBlue}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://google.com")}>
          <Text style={styles.buttonTextBlue}>Terms and Conditions</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  links: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  appLogo: {
    height: 250,
    width: 400,
  },
  input: {
    height: 200,
    paddingHorizontal: 20,
    borderColor: "tomato",
    borderWidth: 1,
    borderRadius: 7,
  },
  subjectInput: {
    height: 40,
    paddingHorizontal: 20,
    borderColor: "tomato",
    borderWidth: 1,
    borderRadius: 7,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
  },
  button: {
    backgroundColor: "red",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonTextRed: {
    color: "red",
  },
  buttonTextBlue: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
