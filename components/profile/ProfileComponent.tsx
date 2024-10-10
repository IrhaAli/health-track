import { ScrollView } from "react-native";
import ProfileFooterLinks from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";
import { Button } from "react-native-paper";
import { Link } from "expo-router";

export default function ProfileComponent() {
  return (
    <>
      <ScrollView>
        <ProfileHeader></ProfileHeader>
        <Button mode="contained">
          <Link href="/(profile)/background_information">
            Background Information
          </Link>
        </Button>
        <Button mode="contained">
          <Link href="/(profile)/dietary_preferences">Dietary Preferences</Link>
        </Button>
        <Button mode="contained">
          <Link href="/(profile)/medical_history">Medical History</Link>
        </Button>
        <Button mode="contained">
          <Link href="/(profile)/stress_level">Stress Level</Link>
        </Button>
        <ProfileFooterLinks></ProfileFooterLinks>
      </ScrollView>
    </>
  );
}
