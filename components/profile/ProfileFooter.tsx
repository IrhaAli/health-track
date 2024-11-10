import { Linking, StyleSheet, View } from "react-native";
import AlertAsync from "react-native-alert-async";
import { Button, Surface, Text, useTheme, Divider, Dialog, Portal, ActivityIndicator } from "react-native-paper";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser, setUserId } from "@/store/userSlice";
import { useSession } from "@/ctx";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '@/translations/profile.json';

export default function ProfileFooterLinks() {
  const userObjStr = useSelector((state: RootState) => state.user.userData);
  const userData = userObjStr?.length ? JSON.parse(userObjStr) : null;
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [t, setT] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { signOut } = useSession();

  useEffect(() => {
    const initialize = async () => {
      // Get user
      const userString = await AsyncStorage.getItem('session');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user);
      }

      // Get language
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        const effectiveLanguage = language || 'en';
        setCurrentLanguage(effectiveLanguage);
        setT(translations[effectiveLanguage as keyof typeof translations]);
      } catch (error) {
        console.error('Error getting language:', error);
        setCurrentLanguage('en');
        setT(translations.en);
      }
    };

    initialize();
  }, []);

  const handleLanguageSelect = async (language: string) => {
    try {
      setIsLanguageLoading(true);
      setLanguageDialogVisible(false);
      
      await AsyncStorage.setItem('userLanguage', language);
      setCurrentLanguage(language);
      setT(translations[language as keyof typeof translations]);
      
      // Add artificial delay after everything is changed
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error saving language:', error);
    } finally {
      setIsLanguageLoading(false);
    }
  };

  const onLogout = () => {
    dispatch(setUser(null));
    dispatch(setUserId(null));
    signOut();
  };

  const onAccountDelete = async () => {
    if (!t) return;

    const choice = await AlertAsync(
      t.deleteAccountTitle,
      t.deleteAccountMessage,
      [
        { text: t.yes, onPress: () => true },
        { text: t.no, onPress: () => false },
      ]
    );

    if (!choice) return;

    try {
      const deleteAccount = doc(db, "users", userData.id);
      await updateDoc(deleteAccount, {
        is_deleted: true,
      }).then(() => currentUser.delete());
    } catch (error) {
      console.log(t.deleteAccountError, error);
    }

    onLogout();
  };

  if (!t) return null;

  return (
    <Surface style={styles.container} elevation={1}>
      <Button
        mode="contained"
        onPress={onLogout}
        style={styles.logoutButton}
        contentStyle={[styles.buttonContent, currentLanguage === 'ar' && {flexDirection: 'row-reverse'}]}
        labelStyle={styles.buttonLabel}
        icon="logout"
      >
        {t.logout}
      </Button>

      <Divider style={styles.divider} />

      <View style={styles.links}>
        <Button
          mode="text"
          onPress={onAccountDelete}
          textColor={theme.colors.error}
          icon="account-remove"
          style={styles.linkButton}
          contentStyle={currentLanguage === 'ar' && {flexDirection: 'row-reverse'}}
        >
          {t.deleteAccount}
        </Button>

        <Button
          mode="text"
          onPress={() => Linking.openURL("https://google.com")}
          icon="shield-account" 
          style={styles.linkButton}
          contentStyle={currentLanguage === 'ar' && {flexDirection: 'row-reverse'}}
        >
          {t.privacyPolicy}
        </Button>

        <Button
          mode="text"
          onPress={() => Linking.openURL("https://google.com")}
          icon="file-document"
          style={styles.linkButton}
          contentStyle={currentLanguage === 'ar' && {flexDirection: 'row-reverse'}}
        >
          {t.termsAndConditions}
        </Button>

        <Button
          mode="text"
          onPress={() => setLanguageDialogVisible(true)}
          icon="translate"
          style={styles.linkButton}
          contentStyle={currentLanguage === 'ar' && {flexDirection: 'row-reverse'}}
        >
          {t.changeLanguage}
        </Button>

        <Portal>
          <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
            <Dialog.Title style={styles.dialogTitle}>Select Language</Dialog.Title>
            <Dialog.Content style={styles.dialogContent}>
              <Button
                mode="contained-tonal"
                onPress={() => handleLanguageSelect('en')}
                style={[styles.dialogButton, currentLanguage === 'en' && styles.selectedLanguage]}
                labelStyle={[styles.dialogButtonLabel, currentLanguage === 'en' && styles.selectedLanguageLabel]}
                icon="check-circle"
              >
                English
              </Button>
              <Button
                mode="contained-tonal"
                onPress={() => handleLanguageSelect('fr')}
                style={[styles.dialogButton, currentLanguage === 'fr' && styles.selectedLanguage]}
                labelStyle={[styles.dialogButtonLabel, currentLanguage === 'fr' && styles.selectedLanguageLabel]}
                icon="check-circle"
              >
                Français
              </Button>
              <Button
                mode="contained-tonal"
                onPress={() => handleLanguageSelect('ar')}
                style={[styles.dialogButton, currentLanguage === 'ar' && styles.selectedLanguage]}
                labelStyle={[styles.dialogButtonLabel, currentLanguage === 'ar' && styles.selectedLanguageLabel]}
                icon="check-circle"
              >
                عربي
              </Button>
            </Dialog.Content>
          </Dialog>

          <Dialog visible={isLanguageLoading} dismissable={false}>
            <Dialog.Content style={styles.loadingContent}>
              <ActivityIndicator animating={true} size="large" />
              <Text style={styles.loadingText}>Changing language...</Text>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  logoutButton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    letterSpacing: 1,
  },
  divider: {
    marginVertical: 16,
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  linkButton: {
    justifyContent: "flex-start",
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dialogContent: {
    paddingHorizontal: 10,
  },
  dialogButton: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    paddingVertical: 8,
  },
  dialogButtonLabel: {
    fontSize: 16,
  },
  selectedLanguage: {
    backgroundColor: 'tomato',
  },
  selectedLanguageLabel: {
    color: 'white',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  }
});
