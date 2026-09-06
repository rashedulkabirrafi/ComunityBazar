import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
const app = initializeApp({
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
});
const auth = getAuth(app);
if (import.meta.env.VITE_AUTH_EMULATOR_URL && !auth.emulatorConfig) {
  connectAuthEmulator(auth, import.meta.env.VITE_AUTH_EMULATOR_URL, {
    disableWarnings: true,
  });
}
export default auth;
