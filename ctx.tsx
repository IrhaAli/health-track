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
  const [initialRoute, setInitialRoute] = React.useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        console.log('Has launched:', hasLaunched);
        const language = await AsyncStorage.getItem('userLanguage');
        console.log('User language:', language);
        const savedSession = await AsyncStorage.getItem('session');
        console.log('Saved session:', savedSession);

        if (!hasLaunched) {
          console.log('First launch detected');
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
          setInitialRoute('/language');
        } else {
          console.log('Not first launch');
          setIsFirstLaunch(false);
          if (savedSession) {
            console.log('Found saved session, setting session');
            await setSession(savedSession);
            if (!language) {
              console.log('No language set, routing to language selection');
              setInitialRoute('/language');
            } else {
              console.log('Language found, routing to root');
              setInitialRoute('/(root)');
            }
          } else {
            console.log('No saved session found, routing to login');
            setInitialRoute('/login');
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsFirstLaunch(false);
        setInitialRoute('/login');
      } finally {
        console.log('App initialization complete');
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    console.log('Route effect triggered:', { initialRoute, isInitializing });
    if (initialRoute && !isInitializing) {
      console.log('Replacing route with:', initialRoute);
      router.replace(initialRoute);
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
      console.error('Auth state change error:', error);
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
      setInitialRoute('/login');
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
