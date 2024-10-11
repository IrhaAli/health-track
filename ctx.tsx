import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from "./useStorageState";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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
  console.log('NODE_ENV', process.env.NODE_ENV);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext.Provider
      value={{
        signIn: (email: string, password: string): Promise<any> => {
          return new Promise((resolve, reject) => {
            
            const auth = getAuth();
            signInWithEmailAndPassword(auth, email, password)
              .then((userCredential: any) => {
                
                console.log('userCredential', userCredential);
                
                // if(userCredential?.user?.uid){

                //   setSession('userId', userCredential.user.uid);
                //   // Optionally, save the ID token in the session
                //   user.getIdToken().then((idToken) => {
                    setSession(userCredential);
                //   });
                // }

                
                
                
                resolve(userCredential);
              })
              .catch((error) => {
                reject(error);
              });
  
  
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
