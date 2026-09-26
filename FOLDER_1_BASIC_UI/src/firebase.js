import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBrwvTeJKQEEPvb_s2Rbf8FPhgpgHd9u1E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mindful-life-os-database.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mindful-life-os-database",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mindful-life-os-database.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "389844129421",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:389844129421:web:f3c4e76c5cdda3325574c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
