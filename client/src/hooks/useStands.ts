import * as React from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Stand } from '../types';

export function useStands() {
  const [stands, setStands] = React.useState<Stand[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'stands'), orderBy('number'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const standsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Stand[];
      setStands(standsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addStand = async (standData: Omit<Stand, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'stands'), {
        ...standData,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding stand:', error);
    }
  };

  const deleteStand = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stands', id));
    } catch (error) {
      console.error('Error deleting stand:', error);
    }
  };

  return { stands, loading, addStand, deleteStand };
}
