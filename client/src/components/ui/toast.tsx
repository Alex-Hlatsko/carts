import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full px-4">
      <div className={`flex items-center p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 mr-3" />
        ) : (
          <XCircle className="w-5 h-5 mr-3" />
        )}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="ml-3">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastComponent };
}
