import React, { useContext, createContext, type PropsWithChildren, useEffect } from 'react';
import { useStorageState } from "./useStorageState";
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}

const AuthContextDefault: AuthContextType = {
  signIn: async (email: string, password: string) => null,
  signOut: () => {},
  session: null,
  isLoading: true,
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
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [lastAuthCheck, setLastAuthCheck] = React.useState<number>(0);
  const ONE_HOUR = 3600000; // 1 hour in milliseconds

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [savedSession, lastCheck] = await Promise.all([
          AsyncStorage.getItem('session'),
          AsyncStorage.getItem('lastAuthCheck')
        ]);

        if (lastCheck) {
          setLastAuthCheck(parseInt(lastCheck));
        }

        if (savedSession) {
          await setSession(savedSession);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Check auth state immediately on mount
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChange);
    initializeApp();

    return () => unsubscribe();
  }, []);

  // Separate useEffect for navigation after initialization
  useEffect(() => {
    if (!isInitializing && !isLoading) {
      if (session) {
        router.replace('/(root)');
      } else {
        router.replace('/login');
      }
    }
  }, [isInitializing, isLoading, session]);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const checkAuth = async () => {
      const currentTime = Date.now();
      if (currentTime - lastAuthCheck >= ONE_HOUR) {
        unsubscribe = onAuthStateChanged(auth, onAuthStateChange);
        setLastAuthCheck(currentTime);
        await AsyncStorage.setItem('lastAuthCheck', currentTime.toString());
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, ONE_HOUR);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      clearInterval(interval);
    };
  }, [lastAuthCheck]);

  const onAuthStateChange = async (user: any) => {
    try {
      const currentTime = Date.now();

      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        };
        const userString = JSON.stringify(userData);
        await Promise.all([
          AsyncStorage.setItem('session', userString),
          AsyncStorage.setItem('lastAuthCheck', currentTime.toString()),
          setSession(userString)
        ]);
        setLastAuthCheck(currentTime);
      } else {
        await Promise.all([
          AsyncStorage.removeItem('session'),
          AsyncStorage.removeItem('lastAuthCheck'),
          setSession(null)
        ]);
        setLastAuthCheck(0);
      }
    } catch (error) {
      console.error('Auth state change error:', error);
      await setSession(null);
    } finally {
      setIsInitializing(false);
    }
  };

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
      const currentTime = Date.now();
      
      await Promise.all([
        AsyncStorage.setItem('session', userString),
        AsyncStorage.setItem('lastAuthCheck', currentTime.toString()),
        setSession(userString)
      ]);
      setLastAuthCheck(currentTime);
      return userCredential;
    } catch (error) {
      await Promise.all([
        AsyncStorage.removeItem('session'),
        AsyncStorage.removeItem('lastAuthCheck'),
        setSession(null)
      ]);
      setLastAuthCheck(0);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await Promise.all([
        auth.signOut(),
        AsyncStorage.removeItem('session'),
        AsyncStorage.removeItem('lastAuthCheck'),
        setSession(null)
      ]);
      setLastAuthCheck(0);
    } catch (error) {
      console.error('Sign out error:', error);
      await Promise.all([
        AsyncStorage.removeItem('session'),
        AsyncStorage.removeItem('lastAuthCheck'),
        setSession(null)
      ]);
      setLastAuthCheck(0);
    }
  };

  if (isInitializing || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff' }}>
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
        isLoading: false,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
