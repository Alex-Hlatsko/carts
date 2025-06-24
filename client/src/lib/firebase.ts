import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
export const storage = getStorage(app);

// Helper functions for materials
export const addMaterial = async (name: string, imageUrl: string) => {
  try {
    const docRef = await addDoc(collection(db, 'materials'), {
      name,
      imageUrl,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding material:', error);
    throw error;
  }
};

export const getMaterials = async () => {
  try {
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting materials:', error);
    throw error;
  }
};

export const deleteMaterial = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'materials', id));
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

// Helper functions for stands
export const addStand = async (standData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'stands'), {
      ...standData,
      status: 'В зале',
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding stand:', error);
    throw error;
  }
};

export const getStands = async () => {
  try {
    const q = query(collection(db, 'stands'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting stands:', error);
    throw error;
  }
};

export const updateStandStatus = async (id: string, status: string) => {
  try {
    await updateDoc(doc(db, 'stands', id), { status });
  } catch (error) {
    console.error('Error updating stand status:', error);
    throw error;
  }
};

// Helper functions for reports
export const addReport = async (reportData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

export const getReports = async () => {
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
};
