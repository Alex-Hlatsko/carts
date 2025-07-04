import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - add your config here
const firebaseConfig = {
  apiKey: "AIzaSyBB0dOHC8-nA6c6fGWglFQRR8pdCs-LAic",
  authDomain: "jwcarts-82c8f.firebaseapp.com",
  projectId: "jwcarts-82c8f",
  storageBucket: "jwcarts-82c8f.firebasestorage.app",
  messagingSenderId: "602423977795",
  appId: "1:602423977795:web:c61436084821d5c24af1f6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
