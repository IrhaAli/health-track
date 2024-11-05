import { useEffect, useCallback, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getAuth } from 'firebase/auth';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>();
  const auth = getAuth();

  // Get
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          setState(localStorage.getItem(key));
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
    } else {
      // First check current auth state
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        SecureStore.getItemAsync(key).then(value => {
          if (value === currentUser.uid) {
            setState(value);
          }
        }).catch(error => {
          console.error('Error retrieving initial value from SecureStore:', error);
        });
      }

      // Then listen for changes
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        try {
          const value = await SecureStore.getItemAsync(key);
          if (user?.uid) {
            if (!value || value !== user.uid) {
              // Update storage if needed
              await setStorageItemAsync(key, user.uid);
            }
            setState(user.uid);
          } else {
            setState(null);
          }
        } catch (error) {
          console.error('Error retrieving value from SecureStore:', error);
          setState(null);
        }
      });

      return () => unsubscribe();
    }
  }, [key]);

  // Set
  const setValue = useCallback(
    async (value: string | null) => {
      await setStorageItemAsync(key, value);
      setState(value);
    },
    [key]
  );

  return [state, setValue];
}
