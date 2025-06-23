import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseInstances, isFirebaseInitialized } from '@/lib/firebase';

// Function to resize image
const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

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
      
      // Resize image for better performance (max 400x600 for vertical images)
      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      const resizedFile = await resizeImage(file, 400, 600, 0.85);
      console.log('Resized file size:', (resizedFile.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Create a simple filename without special characters
      const timestamp = Date.now();
      const extension = resizedFile.type.split('/')[1] || 'jpg';
      const fileName = `stand_${timestamp}.${extension}`;
      
      const storageRef = ref(storage, `${path}/${fileName}`);
      
      console.log('Uploading to:', storageRef.fullPath);
      
      const snapshot = await uploadBytes(storageRef, resizedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Upload successful, URL:', downloadURL);
      return downloadURL;
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // More specific error handling
      if (err.code === 'storage/unauthorized') {
        setError('Недостаточно прав для загрузки. Проверьте настройки Firebase Storage в настройках приложения.');
      } else if (err.code === 'storage/canceled') {
        setError('Загрузка отменена.');
      } else if (err.code === 'storage/unknown') {
        setError('Неизвестная ошибка Firebase Storage. Проверьте настройки проекта.');
      } else if (err.message?.includes('CORS')) {
        setError('Ошибка CORS. Необходимо настроить Firebase Storage (см. настройки).');
      } else {
        setError(err.message || 'Ошибка загрузки изображения');
      }
      
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