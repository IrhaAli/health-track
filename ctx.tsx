import React, { useContext, createContext, type PropsWithChildren, useEffect } from 'react';
import { useStorageState } from "./useStorageState";
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ActivityIndicator, View, InteractionManager } from 'react-native';

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
  isFirstLaunch: boolean | null;
}

const AuthContextDefault: AuthContextType = {
  signIn: async (email: string, password: string) => null,
  signOut: () => {},
  session: null,
  isLoading: true,
  isFirstLaunch: null
};

const AuthContext = createContext<AuthContextType>(AuthContextDefault);

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [initialRoute, setInitialRoute] = React.useState<string | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        const language = await AsyncStorage.getItem('userLanguage');
        const savedSession = await AsyncStorage.getItem('session');

        if (!hasLaunched) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
          setInitialRoute('/language');
        } else {
          setIsFirstLaunch(false);
          if (savedSession) {
            await setSession(savedSession);
            if (!language) {
              setInitialRoute('/language');
            } else {
              setInitialRoute('/(root)');
            }
          } else {
            setInitialRoute('/login');
          }
        }
      } catch (error) {
        setIsFirstLaunch(false);
        setInitialRoute('/login');
      } finally {
        setIsInitializing(false);
      }
    };

    InteractionManager.runAfterInteractions(() => {
      initializeApp();
    });
  }, []);

  useEffect(() => {
    if (initialRoute && !isInitializing) {
      InteractionManager.runAfterInteractions(() => {
        router.replace(initialRoute);
      });
    }
  }, [initialRoute, isInitializing]);

  const onAuthStateChange = async (user: any) => {
    try {
      const language = await AsyncStorage.getItem('userLanguage');

      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        };
        const userString = JSON.stringify(userData);
        await AsyncStorage.setItem('session', userString);
        await setSession(userString);

        if (!language) {
          setInitialRoute('/language');
        } else {
          setInitialRoute('/(root)');
        }
      } else {
        await AsyncStorage.removeItem('session');
        await setSession(null);
        setInitialRoute('/login');
      }
    } catch (error) {
      await setSession(null);
      setInitialRoute('/login');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChange);
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string): Promise<any> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential?.user?.uid) {
        throw new Error('Login failed - no user ID');
      }
      
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
      const userString = JSON.stringify(userData);
      await AsyncStorage.setItem('session', userString);
      await setSession(userString);

      const language = await AsyncStorage.getItem('userLanguage');
      if (!language) {
        setInitialRoute('/language');
      } else {
        setInitialRoute('/(root)');
      }
      return userCredential;
    } catch (error) {
      await AsyncStorage.removeItem('session');
      await setSession(null);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('session');
      await setSession(null);
      setInitialRoute('/login');
    } catch (error) {
      await AsyncStorage.removeItem('session');
      await setSession(null);
    }
  };

  if (isInitializing || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signOut: handleSignOut,
        session,
        isLoading,
        isFirstLaunch
      }}>
      {children}
    </AuthContext.Provider>
  );
}
