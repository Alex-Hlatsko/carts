import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
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
    const unsubscribe = onSnapshot(
      query(collection(db, collectionName), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Firestore timestamps to Date objects
          const convertTimestamps = (obj: any): any => {
            if (obj instanceof Timestamp) {
              return obj.toDate();
            }
            if (Array.isArray(obj)) {
              return obj.map(convertTimestamps);
            }
            if (obj && typeof obj === 'object') {
              const converted: any = {};
              for (const [key, value] of Object.entries(obj)) {
                converted[key] = convertTimestamps(value);
              }
              return converted;
            }
            return obj;
          };

          return {
            id: doc.id,
            ...convertTimestamps(data)
          };
        }) as T[];
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

  const add = async (item: Omit<T, 'id'>) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: new Date()
      });
      return true;
    } catch (err) {
      console.error('Error adding document:', err);
      return false;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      await updateDoc(doc(db, collectionName, id), updates);
      return true;
    } catch (err) {
      console.error('Error updating document:', err);
      return false;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      return false;
    }
  };

  return { data, loading, error, add, update, remove };
}
