import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBB0dOHC8-nA6c6fGWglFQRR8pdCs-LAic",
  authDomain: "jwcarts-82c8f.firebaseapp.com",
  projectId: "jwcarts-82c8f",
  storageBucket: "jwcarts-82c8f.firebasestorage.app",
  messagingSenderId: "602423977795",
  appId: "1:602423977795:web:c61436084821d5c24af1f6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
