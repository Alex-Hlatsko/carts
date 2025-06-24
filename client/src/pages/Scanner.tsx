import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/QRScanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, ChecklistItem, ResponsiblePerson, Report } from '@/types';
import { useToast, Toast } from '@/components/ui/toast';
import { QrCode, FileCheck, Users } from 'lucide-react';

export function Scanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showChecklistDialog, setShowChecklistDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [scannedStandId, setScannedStandId] = useState<string>('');
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [checklistAnswers, setChecklistAnswers] = useState<{ [key: string]: boolean }>({});
  const [signature, setSignature] = useState('');
  const [issueForm, setIssueForm] = useState({ issuedBy: '', issuedTo: '' });

  const { data: stands, update: updateStand } = useCollection<Stand>('stands');
  const { data: checklistItems } = useCollection<ChecklistItem>('checklist');
  const { data: responsiblePeople } = useCollection<ResponsiblePerson>('responsiblePeople');
  const { add: addReport } = useCollection<Report>('reports');
  const { toast, showToast, hideToast } = useToast();

  const handleScan = (result: string) => {
    console.log('Scanned QR code:', result);
    
    // Try to extract stand number from different QR code formats
    let standNumber = '';
    
    if (result.startsWith('STAND_')) {
      standNumber = result.replace('STAND_', '');
    } else {
      // Try to find any numbers in the QR code
      const numbers = result.match(/\d+/);
      if (numbers) {
        standNumber = numbers[0];
      } else {
        standNumber = result; // Use the whole result as stand number
      }
    }
    
    console.log('Looking for stand number:', standNumber);
    
    const stand = stands.find(s => 
      s.number === standNumber || 
      s.number === result ||
      s.id === result ||
      result.includes(s.number)
    );
    
    if (stand) {
      console.log('Found stand:', stand);
      setScannedStandId(standNumber);
      setSelectedStand(stand);
      setShowScanner(false);
      setShowActionDialog(true);
    } else {
      console.log('Stand not found. Available stands:', stands.map(s => s.number));
      showToast(`Стенд не найден. Отсканированный код: ${result}`, 'error');
      setShowScanner(false);
    }
  };

  const handleAccept = () => {
    setShowActionDialog(false);
    setShowChecklistDialog(true);
  };

  const handleIssue = () => {
    setShowActionDialog(false);
    setShowIssueDialog(true);
  };

  const submitChecklist = async () => {
    if (!selectedStand || !signature) {
      showToast('Заполните все поля', 'error');
      return;
    }

    const report: Omit<Report, 'id'> = {
      standId: selectedStand.id,
      standNumber: selectedStand.number,
      type: 'accept',
      checklist: checklistAnswers,
      signature,
      createdAt: new Date()
    };

    const reportResult = await addReport(report);
    if (reportResult.success) {
      const updateResult = await updateStand(selectedStand.id, { 
        status: 'В Зале Царства' 
      });
      
      if (updateResult.success) {
        showToast('Стенд успешно принят', 'success');
      } else {
        showToast('Ошибка при обновлении статуса', 'error');
      }
    } else {
      showToast('Ошибка при создании отчёта', 'error');
    }

    resetForms();
  };

  const submitIssue = async () => {
    if (!selectedStand || !issueForm.issuedBy || !issueForm.issuedTo) {
      showToast('Заполните все поля', 'error');
      return;
    }

    const report: Omit<Report, 'id'> = {
      standId: selectedStand.id,
      standNumber: selectedStand.number,
      type: 'issue',
      checklist: {},
      signature: issueForm.issuedBy,
      issuedBy: issueForm.issuedBy,
      issuedTo: issueForm.issuedTo,
      createdAt: new Date()
    };

    const reportResult = await addReport(report);
    if (reportResult.success) {
      const updateResult = await updateStand(selectedStand.id, { 
        status: issueForm.issuedTo 
      });
      
      if (updateResult.success) {
        showToast('Стенд успешно выдан', 'success');
      } else {
        showToast('Ошибка при обновлении статуса', 'error');
      }
    } else {
      showToast('Ошибка при создании отчёта', 'error');
    }

    resetForms();
  };

  const resetForms = () => {
    setShowChecklistDialog(false);
    setShowIssueDialog(false);
    setSelectedStand(null);
    setChecklistAnswers({});
    setSignature('');
    setIssueForm({ issuedBy: '', issuedTo: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-6">
        <QrCode className="w-24 h-24 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">Сканер QR кодов</h1>
        <p className="text-muted-foreground">
          Нажмите кнопку ниже, чтобы отсканировать QR код стенда
        </p>
        
        <Button 
          onClick={() => setShowScanner(true)}
          size="lg"
          className="w-full max-w-sm"
        >
          <QrCode className="w-5 h-5 mr-2" />
          Открыть сканер
        </Button>
        
        {stands.length > 0 && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Доступные стенды:</h3>
            <div className="text-sm text-muted-foreground">
              {stands.map(stand => (
                <div key={stand.id}>
                  Стенд {stand.number} - {stand.theme}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showScanner && (
        <QRScanner 
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Стенд {selectedStand?.number}</DialogTitle>
            <DialogDescription>
              Тема: {selectedStand?.theme}<br/>
              Статус: {selectedStand?.status}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col space-y-2">
            <Button onClick={handleAccept} className="w-full">
              <FileCheck className="w-4 h-4 mr-2" />
              Принять
            </Button>
            <Button onClick={handleIssue} variant="outline" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Выдать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChecklistDialog} onOpenChange={setShowChecklistDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Чек-лист для стенда {selectedStand?.number}</DialogTitle>
            <DialogDescription>
              Заполните все пункты и подпишите отчёт
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={checklistAnswers[item.id] || false}
                  onCheckedChange={(checked) => 
                    setChecklistAnswers(prev => ({ ...prev, [item.id]: !!checked }))
                  }
                />
                <Label htmlFor={item.id} className="text-sm">
                  {item.text}
                </Label>
              </div>
            ))}
            
            <div className="space-y-2">
              <Label htmlFor="signature">Подпись ответственного</Label>
              <Select value={signature} onValueChange={setSignature}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите ответственного" />
                </SelectTrigger>
                <SelectContent>
                  {responsiblePeople.map((person) => (
                    <SelectItem key={person.id} value={person.name}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForms}>
              Отмена
            </Button>
            <Button onClick={submitChecklist}>
              Отправить отчёт
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выдача стенда {selectedStand?.number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issuedBy">Кто выдаёт</Label>
              <Select 
                value={issueForm.issuedBy} 
                onValueChange={(value) => setIssueForm(prev => ({ ...prev, issuedBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите выдающего" />
                </SelectTrigger>
                <SelectContent>
                  {responsiblePeople.map((person) => (
                    <SelectItem key={person.id} value={person.name}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issuedTo">Кому выдаётся</Label>
              <Select 
                value={issueForm.issuedTo} 
                onValueChange={(value) => setIssueForm(prev => ({ ...prev, issuedTo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите получателя" />
                </SelectTrigger>
                <SelectContent>
                  {responsiblePeople.map((person) => (
                    <SelectItem key={person.id} value={person.name}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForms}>
              Отмена
            </Button>
            <Button onClick={submitIssue}>
              Выдать стенд
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </div>
  );
}
