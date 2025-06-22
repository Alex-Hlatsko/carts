import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { FirebaseConfig } from '@/types';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const getStoredConfig = (): FirebaseConfig | null => {
  try {
    const stored = localStorage.getItem('firebaseConfig');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initializeFirebase = (config: FirebaseConfig) => {
  try {
    app = initializeApp(config);
    db = getFirestore(app);
    storage = getStorage(app);
    localStorage.setItem('firebaseConfig', JSON.stringify(config));
    return { app, db, storage };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

// Auto-initialize if config exists
const storedConfig = getStoredConfig();
if (storedConfig) {
  try {
    initializeFirebase(storedConfig);
  } catch (error) {
    console.warn('Failed to auto-initialize Firebase with stored config');
  }
}

export const getFirebaseInstances = () => {
  if (!app || !db || !storage) {
    throw new Error('Firebase not initialized. Please configure Firebase first.');
  }
  return { app, db, storage };
};

export const isFirebaseInitialized = () => {
  return !!(app && db && storage);
};

export const configureFirebase = (config: FirebaseConfig) => {
  return initializeFirebase(config);
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem('firebaseConfig');
  app = null;
  db = null;
  storage = null;
};

export { db, storage };
export default app;