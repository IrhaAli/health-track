import ProfileFooterLinks from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";
import { Button } from "react-native-paper";
import { Link } from "expo-router";
import ProfileContactForm from "./ProfileContactForm";

export default function ProfileComponent() {
  return (
    <>
      <ProfileHeader></ProfileHeader>
      <Link href="/(profile)/background_information">
        <Button mode="contained">Background Information</Button>
      </Link>
      <Link href="/(profile)/dietary_preferences">
        <Button mode="contained">Dietary Preferences</Button>
      </Link>
      <Link href="/(profile)/medical_history">
        <Button mode="contained">Medical History</Button>
      </Link>
      <Link href="/(profile)/stress_level">
        <Button mode="contained">Stress Level</Button>
      </Link>
      <ProfileContactForm></ProfileContactForm>
      <ProfileFooterLinks></ProfileFooterLinks>
    </>
  );
}
