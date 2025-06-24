import * as React from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChecklistItem } from '../types';

export function useChecklist() {
  const [checklistItems, setChecklistItems] = React.useState<ChecklistItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'checklist'), orderBy('order'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChecklistItem[];
      setChecklistItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addChecklistItem = async (text: string) => {
    try {
      await addDoc(collection(db, 'checklist'), {
        text,
        order: checklistItems.length
      });
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const deleteChecklistItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'checklist', id));
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  return { checklistItems, loading, addChecklistItem, deleteChecklistItem };
}
