import * as React from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Material } from '../types';

export function useMaterials() {
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const materialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Material[];
      setMaterials(materialsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addMaterial = async (materialData: Omit<Material, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'materials'), {
        ...materialData,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'materials', id));
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  return { materials, loading, addMaterial, deleteMaterial };
}
