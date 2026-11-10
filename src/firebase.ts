import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKk_s0IuQmfcdNz40pw_EcSI5IdyvEtG4",
  authDomain: "ds-marmitas.firebaseapp.com",
  projectId: "ds-marmitas",
  storageBucket: "ds-marmitas.firebasestorage.app",
  messagingSenderId: "229890874954",
  appId: "1:229890874954:web:a4cbf94121aab3457790b3",
  measurementId: "G-45P6YCYS0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics not initialized:", e);
      }
    }
  }).catch(() => {});
}

