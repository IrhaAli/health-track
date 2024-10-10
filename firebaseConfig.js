import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from "firebase/auth"
import { getReactNativePersistence, setPersistence, browserSessionPersistence } from "firebase/auth";
import { AsyncStorage } from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  databaseURL: 'https://health-app-97.firebase.io/(default)',
  apiKey: "AIzaSyBwpovW3dwMlah_eGc2PS5dgBOaQsRh5Xc",
  authDomain: "health-app-97.firebaseapp.com",
  projectId: "health-app-97",
  storageBucket: "health-app-97.appspot.com",
  messagingSenderId: "321117441221",
  appId: "1:321117441221:web:93d44d5a86532e86f8f4ac",
  measurementId: "G-MZ5GTWZVYT"
};


let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const storage = getStorage(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app)

export { db };
