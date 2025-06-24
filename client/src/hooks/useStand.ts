import * as React from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Stand } from '../types';

export function useStand(standId: string) {
  const [stand, setStand] = React.useState<Stand | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStand = async () => {
      try {
        const standDoc = await getDoc(doc(db, 'stands', standId));
        if (standDoc.exists()) {
          setStand({ id: standDoc.id, ...standDoc.data() } as Stand);
        }
      } catch (error) {
        console.error('Error fetching stand:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStand();
  }, [standId]);

  const updateStandStatus = async (standId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'stands', standId), { status });
      setStand(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Error updating stand status:', error);
    }
  };

  return { stand, loading, updateStandStatus };
}
