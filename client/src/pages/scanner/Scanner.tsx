import * as React from 'react';
import { QrScanner } from '@/components/scanner/QrScanner';
import { ActionDialog } from '@/components/scanner/ActionDialog';
import { ChecklistForm } from '@/components/scanner/ChecklistForm';
import { IssueForm } from '@/components/scanner/IssueForm';

export function Scanner() {
  const [scannedCode, setScannedCode] = React.useState<string>('');
  const [showActions, setShowActions] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState<'accept' | 'issue' | null>(null);

  const handleScan = (result: string) => {
    setScannedCode(result);
    setShowActions(true);
  };

  const handleActionSelect = (action: 'accept' | 'issue') => {
    setCurrentAction(action);
    setShowActions(false);
  };

  const handleBack = () => {
    setCurrentAction(null);
    setShowActions(false);
    setScannedCode('');
  };

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold mb-6">Сканер QR-кодов</h1>
      
      {!scannedCode && <QrScanner onScan={handleScan} />}
      
      {showActions && (
        <ActionDialog
          standCode={scannedCode}
          onAction={handleActionSelect}
          onBack={handleBack}
        />
      )}
      
      {currentAction === 'accept' && (
        <ChecklistForm
          standCode={scannedCode}
          onBack={handleBack}
          onComplete={handleBack}
        />
      )}
      
      {currentAction === 'issue' && (
        <IssueForm
          standCode={scannedCode}
          onBack={handleBack}
          onComplete={handleBack}
        />
      )}
    </div>
  );
}
