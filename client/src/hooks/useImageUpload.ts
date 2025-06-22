import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseInstances, isFirebaseInitialized } from '@/lib/firebase';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    if (!file) return null;

    if (!isFirebaseInitialized()) {
      setError('Firebase not configured. Please configure Firebase in Settings.');
      return null;
    }

    setUploading(true);
    setError(null);

    try {
      const { storage } = getFirebaseInstances();
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading,
    error,
  };
}