import * as React from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Report } from '../types';

export function useReports() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Report[];
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addReport = async (reportData: Omit<Report, 'id' | 'createdAt' | 'standNumber'>) => {
    try {
      // Get stand number
      const standDoc = await getDoc(doc(db, 'stands', reportData.standId));
      const standNumber = standDoc.exists() ? standDoc.data().number : 'Unknown';

      await addDoc(collection(db, 'reports'), {
        ...reportData,
        standNumber,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  return { reports, loading, addReport, deleteReport };
}
