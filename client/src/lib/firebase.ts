import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { FirebaseConfig } from '@/types';

// TODO: Replace with your Firebase configuration
const firebaseConfig: FirebaseConfig = {
    apiKey: "AIzaSyBB0dOHC8-nA6c6fGWglFQRR8pdCs-LAic",
    authDomain: "jwcarts-82c8f.firebaseapp.com",
    projectId: "jwcarts-82c8f",
    storageBucket: "jwcarts-82c8f.firebasestorage.app",
    messagingSenderId: "602423977795",
    appId: "1:602423977795:web:c61436084821d5c24af1f6",
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