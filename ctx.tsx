import React, { useContext, createContext, type PropsWithChildren, useEffect } from 'react';
import { useStorageState } from "./useStorageState";
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

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
  isLoading: true
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

  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await setSession(currentUser.uid);
        } else {
          // Ensure session is cleared if no current user
          await setSession(null);
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
          await setSession(user.uid);
        } else {
          await setSession(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        await setSession(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string): Promise<any> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential?.user?.uid) {
        throw new Error('Login failed - no user ID');
      }
      
      // Wait for session to be set before continuing
      await setSession(userCredential.user.uid);
      
      // Double check that auth state is properly set
      if (!auth.currentUser) {
        throw new Error('Login failed - user not properly authenticated');
      }
      
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      await setSession(null);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      await setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Force session clear even if sign out fails
      await setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signOut: handleSignOut,
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
