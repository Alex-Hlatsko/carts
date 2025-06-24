import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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
  }, [collectionName]);

  const addItem = async (item: Omit<T, 'id'>) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  };
}
