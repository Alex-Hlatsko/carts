import * as React from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ResponsiblePerson } from '../types/responsiblePerson';

export function useResponsiblePersons() {
  const [responsiblePersons, setResponsiblePersons] = React.useState<ResponsiblePerson[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'responsiblePersons'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const persons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as ResponsiblePerson[];
      setResponsiblePersons(persons);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addResponsiblePerson = async (name: string) => {
    try {
      await addDoc(collection(db, 'responsiblePersons'), {
        name,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding responsible person:', error);
      throw error;
    }
  };

  const deleteResponsiblePerson = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'responsiblePersons', id));
    } catch (error) {
      console.error('Error deleting responsible person:', error);
      throw error;
    }
  };

  return { responsiblePersons, loading, addResponsiblePerson, deleteResponsiblePerson };
}
