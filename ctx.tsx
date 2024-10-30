import React, { useContext, createContext, type PropsWithChildren, useEffect } from 'react';
import { useStorageState } from "./useStorageState";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: (email: string, password: string) => Promise.resolve(null),
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
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
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSession(user.uid);
      } else {
        setSession(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: (email: string, password: string): Promise<any> => {
          return new Promise((resolve, reject) => {
            const auth = getAuth();
            signInWithEmailAndPassword(auth, email, password)
              .then((userCredential: any) => {

                if (userCredential?.user?.uid) {
                  setSession(userCredential.user.uid);
                  resolve(userCredential);
                }
                else {
                  console.log('else worked in login');
                  reject('failed');
                }

              })
              .catch((error) => { reject(error); });
          })
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
