import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q;
    try {
      q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    } catch {
      // If createdAt doesn't exist, just use the collection without ordering
      q = query(collection(db, collectionName));
    }
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const docData = doc.data();
          // Convert Firestore Timestamps to JavaScript Dates
          const convertedData = Object.keys(docData).reduce((acc, key) => {
            const value = docData[key];
            if (value instanceof Timestamp) {
              acc[key] = value.toDate();
            } else {
              acc[key] = value;
            }
            return acc;
          }, {} as any);
          
          return {
            id: doc.id,
            ...convertedData
          };
        }) as T[];
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const addItem = async (item: Omit<T, 'id'>) => {
    try {
      const itemWithTimestamps = {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(collection(db, collectionName), itemWithTimestamps);
      return { success: true };
    } catch (err: any) {
      console.error('Error adding item:', err);
      return { success: false, error: err.message };
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, collectionName, id), updatesWithTimestamp);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating item:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting item:', err);
      return { success: false, error: err.message };
    }
  };

  return { data, loading, error, addItem, updateItem, deleteItem };
}
