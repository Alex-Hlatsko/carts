import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { QRScanner } from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/Toast';
import { useNavigate } from 'react-router-dom';

export function Scanner() {
  const [scannedCode, setScannedCode] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const handleScan = (result: string) => {
    setScannedCode(result);
    setShowToast({ message: 'QR код успешно отсканирован!', type: 'success' });
  };

  const handleError = (error: string) => {
    setShowToast({ message: error, type: 'error' });
  };

  const handleAccept = () => {
    navigate(`/checklist/${scannedCode}`);
  };

  const handleIssue = () => {
    navigate(`/issue/${scannedCode}`);
  };

  const resetScanner = () => {
    setScannedCode('');
  };

  return (
    <Layout title="Сканер QR кода">
      <div className="space-y-6">
        {!scannedCode ? (
          <QRScanner onScan={handleScan} onError={handleError} />
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                Отсканированный код:
              </p>
              <p className="font-mono text-lg text-green-900 dark:text-green-100">
                {scannedCode}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleAccept} className="h-12">
                Принять
              </Button>
              <Button onClick={handleIssue} variant="outline" className="h-12">
                Выдать
              </Button>
            </div>
            
            <Button onClick={resetScanner} variant="ghost" className="w-full">
              Сканировать еще раз
            </Button>
          </div>
        )}
      </div>
      
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </Layout>
  );
}
