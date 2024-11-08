import React, { useContext, createContext, type PropsWithChildren, useEffect } from 'react';
import { useStorageState } from "./useStorageState";
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        const language = await AsyncStorage.getItem('userLanguage');
        const savedSession = await AsyncStorage.getItem('session');

        // Clear first launch state for testing
        if (__DEV__) {
          await AsyncStorage.removeItem('hasLaunched');
          await AsyncStorage.removeItem('userLanguage');
        }

        if (!hasLaunched || !language) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
          // Delay navigation until after initial render
          setTimeout(() => {
            router.replace('/language');
          }, 0);
        } else {
          setIsFirstLaunch(false);
          if (savedSession) {
            await setSession(savedSession);
            // Delay navigation until after initial render
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 0);
          } else {
            // Delay navigation until after initial render
            setTimeout(() => {
              router.replace('/login');
            }, 0);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsFirstLaunch(false);
        // Delay navigation until after initial render
        setTimeout(() => {
          router.replace('/login');
        }, 0);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Only proceed with session check if not first launch
    if (isFirstLaunch === null || isFirstLaunch) {
      return;
    }

    const checkInitialSession = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          };
          const userString = JSON.stringify(userData);
          await AsyncStorage.setItem('session', userString);
          await setSession(userString);
        } else {
          const savedSession = await AsyncStorage.getItem('session');
          if (savedSession) {
            await setSession(savedSession);
          } else {
            await setSession(null);
          }
        }
      } catch (error) {
        console.error('Initial session check error:', error);
        await setSession(null);
      }
    };
    
    checkInitialSession();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          };
          const userString = JSON.stringify(userData);
          await AsyncStorage.setItem('session', userString);
          await setSession(userString);
        } else {
          await AsyncStorage.removeItem('session');
          await setSession(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        await setSession(null);
      }
    });

    return () => unsubscribe();
  }, [isFirstLaunch]);

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
      
      if (!auth.currentUser) {
        throw new Error('Login failed - user not properly authenticated');
      }
      
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
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
    } catch (error) {
      console.error('Sign out error:', error);
      await AsyncStorage.removeItem('session');
      await setSession(null);
    }
  };

  if (isInitializing) {
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
