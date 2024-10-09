import { StyleSheet, Image, Text } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import ProfileUserDetails from "./ProfileUserDetails";
import ProfileDietaryPreferences from "./ProfileDietaryPreferences";
import ProfileMedicalHistory from "./ProfileMedicalHistory";
import ProfileStressLevel from "./ProfileStressLevel";
import ProfileFooterLinks from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";

export default function ProfileComponent() {
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/home-image.png")}
            style={styles.appLogo}
          />
        }
      >
        <ProfileHeader></ProfileHeader>
        <ProfileUserDetails></ProfileUserDetails>
        <ProfileDietaryPreferences></ProfileDietaryPreferences>
        <ProfileMedicalHistory></ProfileMedicalHistory>
        <ProfileStressLevel></ProfileStressLevel>
        <ProfileFooterLinks></ProfileFooterLinks>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
});
