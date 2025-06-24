import React from 'react';
import { QRScanner } from '@/components/scanner/QRScanner';
import { ActionDialog } from '@/components/scanner/ActionDialog';
import { ChecklistForm } from '@/components/forms/ChecklistForm';
import { GiveOutForm } from '@/components/forms/GiveOutForm';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Stand, ChecklistItem, ResponsiblePerson, Report, StandAction } from '@/types';

export function ScannerPage() {
  const [scannedStand, setScannedStand] = React.useState<Stand | null>(null);
  const [showActionDialog, setShowActionDialog] = React.useState(false);
  const [showChecklistForm, setShowChecklistForm] = React.useState(false);
  const [showGiveOutForm, setShowGiveOutForm] = React.useState(false);

  const { data: stands, updateItem: updateStand } = useCollection<Stand>('stands');
  const { data: checklistItems } = useCollection<ChecklistItem>('checklistItems');
  const { data: responsiblePersons } = useCollection<ResponsiblePerson>('responsiblePersons');
  const { addItem: addReport } = useCollection<Report>('reports');
  const { addItem: addStandAction } = useCollection<StandAction>('standActions');
  const { showSuccess, showError } = useToast();

  const handleScan = React.useCallback((result: string) => {
    const stand = stands.find(s => s.qrCode === result || s.id === result);
    if (stand) {
      setScannedStand(stand);
      setShowActionDialog(true);
    } else {
      showError('Стенд не найден');
    }
  }, [stands, showError]);

  const handleReceive = React.useCallback(() => {
    setShowActionDialog(false);
    setShowChecklistForm(true);
  }, []);

  const handleGiveOut = React.useCallback(() => {
    setShowActionDialog(false);
    setShowGiveOutForm(true);
  }, []);

  const handleChecklistSubmit = React.useCallback(async (data: {
    responsiblePerson: string;
    answers: { checklistItemId: string; answer: boolean; notes?: string }[];
  }) => {
    if (!scannedStand) return;

    const reportResult = await addReport({
      standId: scannedStand.id,
      standNumber: scannedStand.number,
      responsiblePerson: data.responsiblePerson,
      date: new Date(),
      answers: data.answers
    });

    const actionResult = await addStandAction({
      standId: scannedStand.id,
      standNumber: scannedStand.number,
      action: 'принятие',
      responsiblePerson: data.responsiblePerson,
      date: new Date()
    });

    const updateResult = await updateStand(scannedStand.id, {
      status: 'В зале'
    });

    if (reportResult.success && actionResult.success && updateResult.success) {
      showSuccess('Стенд успешно принят');
    } else {
      showError('Ошибка при принятии стенда');
    }

    setShowChecklistForm(false);
    setScannedStand(null);
  }, [scannedStand, addReport, addStandAction, updateStand, showSuccess, showError]);

  const handleGiveOutSubmit = React.useCallback(async (data: {
    responsiblePerson: string;
    recipientName: string;
  }) => {
    if (!scannedStand) return;

    const actionResult = await addStandAction({
      standId: scannedStand.id,
      standNumber: scannedStand.number,
      action: 'выдача',
      responsiblePerson: data.responsiblePerson,
      recipientName: data.recipientName,
      date: new Date()
    });

    const updateResult = await updateStand(scannedStand.id, {
      status: data.recipientName
    });

    if (actionResult.success && updateResult.success) {
      showSuccess('Стенд успешно выдан');
    } else {
      showError('Ошибка при выдаче стенда');
    }

    setShowGiveOutForm(false);
    setScannedStand(null);
  }, [scannedStand, addStandAction, updateStand, showSuccess, showError]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Сканер QR-кодов</h1>
      
      <QRScanner 
        onScan={handleScan}
        onError={showError}
      />

      <ActionDialog
        open={showActionDialog}
        onClose={() => setShowActionDialog(false)}
        stand={scannedStand}
        onReceive={handleReceive}
        onGiveOut={handleGiveOut}
      />

      <ChecklistForm
        open={showChecklistForm}
        onClose={() => setShowChecklistForm(false)}
        stand={scannedStand}
        checklistItems={checklistItems}
        responsiblePersons={responsiblePersons}
        onSubmit={handleChecklistSubmit}
      />

      <GiveOutForm
        open={showGiveOutForm}
        onClose={() => setShowGiveOutForm(false)}
        stand={scannedStand}
        responsiblePersons={responsiblePersons}
        onSubmit={handleGiveOutSubmit}
      />
    </div>
  );
}
