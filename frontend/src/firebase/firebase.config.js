// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import {getAuth, connectAuthEmulator} from "firebase/auth"


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
if (import.meta.env.VITE_AUTH_EMULATOR_URL) {
  connectAuthEmulator(auth, import.meta.env.VITE_AUTH_EMULATOR_URL);
}

export default auth;