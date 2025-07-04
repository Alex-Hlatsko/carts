import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { getFirebaseInstances, isFirebaseInitialized } from '@/lib/firebase';

export function useCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseInitialized()) {
      setError('Firebase not configured. Please configure Firebase in Settings.');
      setLoading(false);
      return;
    }

    try {
      const { db } = getFirebaseInstances();
      const q = query(collection(db, collectionName), orderBy('dateAdded', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dateAdded: doc.data().dateAdded?.toDate(),
            timestamp: doc.data().timestamp?.toDate(),
            dateModified: doc.data().dateModified?.toDate(),
          })) as T[];
          setData(items);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Firebase error');
      setLoading(false);
    }
  }, [collectionName]);

  const addDocument = async (data: Omit<T, 'id'>) => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error('Firebase not configured');
      }
      
      const { db } = getFirebaseInstances();
      await addDoc(collection(db, collectionName), {
        ...data,
        dateAdded: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateDocument = async (id: string, data: Partial<T>) => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error('Firebase not configured');
      }
      
      const { db } = getFirebaseInstances();
      await updateDoc(doc(db, collectionName, id), data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      if (!isFirebaseInitialized()) {
        throw new Error('Firebase not configured');
      }
      
      const { db } = getFirebaseInstances();
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    data,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}