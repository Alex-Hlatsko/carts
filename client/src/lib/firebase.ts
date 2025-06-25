import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { FirebaseConfig } from '@/types';

// TODO: Replace with your Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const initializeFirebase = () => {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    return { app, db, storage };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

// Auto-initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  console.warn('Failed to initialize Firebase. Please check your configuration.');
}

export const getFirebaseInstances = () => {
  if (!app || !db || !storage) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return { app, db, storage };
};

export const isFirebaseInitialized = () => {
  return !!(app && db && storage);
};

export { db, storage };
export default app;