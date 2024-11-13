import { Linking, StyleSheet, View } from "react-native";
import AlertAsync from "react-native-alert-async";
import { Button, Surface, Text, useTheme, Divider, Dialog, Portal, ActivityIndicator } from "react-native-paper";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser, setUserId } from "@/store/userSlice";
import { useSession } from "@/ctx";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import i18n from '@/i18n';
import { I18nManager } from 'react-native';

export default function ProfileFooterLinks() {
  const userObjStr = useSelector((state: RootState) => state.user.userData);
  const userData = userObjStr?.length ? JSON.parse(userObjStr) : null;
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { signOut } = useSession();

  useEffect(() => {
    const initialize = async () => {
      const userString = await AsyncStorage.getItem('session');
      if (userString) {
        setCurrentUser(JSON.parse(userString));
      }
    };

    initialize();
  }, []);

  const handleLanguageSelect = async (language: string) => {
    try {
      setIsLanguageLoading(true);
      setLanguageDialogVisible(false);
      
      // Update i18n locale and save to AsyncStorage
      i18n.locale = language;
      await AsyncStorage.setItem('userLanguage', language);

      // Handle RTL layout for Arabic
      const isRTL = language === 'ar';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      }

      // Always reload app after language change
      await Updates.reloadAsync();

    } catch (error) {
      console.error('Error changing language:', error);
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
    const choice = await AlertAsync(
      i18n.t('deleteAccountTitle'),
      i18n.t('deleteAccountMessage'),
      [
        { text: i18n.t('yes'), onPress: () => true },
        { text: i18n.t('no'), onPress: () => false },
      ]
    );

    if (!choice) return;

    try {
      const deleteAccount = doc(db, "users", userData.id);
      await updateDoc(deleteAccount, {
        is_deleted: true,
      }).then(() => currentUser.delete());
    } catch (error) {
      console.log(i18n.t('deleteAccountError'), error);
    }

    onLogout();
  };

  return (
    <Surface style={styles.container} elevation={1}>
      <Button
        mode="contained"
        onPress={onLogout}
        style={styles.logoutButton}
        contentStyle={[styles.buttonContent]}
        labelStyle={styles.buttonLabel}
        icon="logout"
      >
        {i18n.t('logout')}
      </Button>

      <Divider style={styles.divider} />

      <View style={styles.links}>
        <Button
          mode="text"
          onPress={onAccountDelete}
          textColor={theme.colors.error}
          icon="account-remove"
          style={styles.linkButton}
        >
          {i18n.t('deleteAccount')}
        </Button>

        <Button
          mode="text"
          onPress={() => Linking.openURL("https://google.com")}
          icon="shield-account" 
          style={styles.linkButton}
        >
          {i18n.t('privacyPolicy')}
        </Button>

        <Button
          mode="text"
          onPress={() => Linking.openURL("https://google.com")}
          icon="file-document"
          style={styles.linkButton}
        >
          {i18n.t('termsAndConditions')}
        </Button>

        <Button
          mode="text"
          onPress={() => setLanguageDialogVisible(true)}
          icon="translate"
          style={styles.linkButton}
        >
          {i18n.t('changeLanguage')}
        </Button>

        <Portal>
          <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
            <Dialog.Title style={styles.dialogTitle}>{i18n.t('selectLanguage')}</Dialog.Title>
            <Dialog.Content style={styles.dialogContent}>
              <Button
                mode="contained-tonal"
                onPress={() => handleLanguageSelect('en')}
                style={[styles.dialogButton, i18n.locale === 'en' && styles.selectedLanguage]}
                labelStyle={[styles.dialogButtonLabel, i18n.locale === 'en' && styles.selectedLanguageLabel]}
                icon="check-circle"
              >
                English
              </Button>
              <Button
                mode="contained-tonal"
                onPress={() => handleLanguageSelect('fr')}
                style={[styles.dialogButton, i18n.locale === 'fr' && styles.selectedLanguage]}
                labelStyle={[styles.dialogButtonLabel, i18n.locale === 'fr' && styles.selectedLanguageLabel]}
                icon="check-circle"
              >
                Français
              </Button>
              <Button
                mode="contained-tonal"
                onPress={() => handleLanguageSelect('ar')}
                style={[styles.dialogButton, i18n.locale === 'ar' && styles.selectedLanguage]}
                labelStyle={[styles.dialogButtonLabel, i18n.locale === 'ar' && styles.selectedLanguageLabel]}
                icon="check-circle"
              >
                عربي
              </Button>
            </Dialog.Content>
          </Dialog>

          <Dialog visible={isLanguageLoading} dismissable={false}>
            <Dialog.Content style={styles.loadingContent}>
              <ActivityIndicator animating={true} size="large" />
              <Text style={styles.loadingText}>{i18n.t('changingLanguage')}</Text>
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
