import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

