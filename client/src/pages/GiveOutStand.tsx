import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, ResponsiblePerson, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function GiveOutStand() {
  const { standId } = useParams<{ standId: string }>();
  const navigate = useNavigate();
  const { data: stands, updateItem } = useCollection<Stand>('stands');
  const { data: responsiblePersons } = useCollection<ResponsiblePerson>('responsible-persons');
  const { addItem: addTransaction } = useCollection<Transaction>('transactions');
  const { showToast, ToastComponent } = useToast();

  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stand = stands.find(s => s.id === standId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !recipientName.trim() || !standId || !stand) return;

    setIsSubmitting(true);

    const selectedPerson = responsiblePersons.find(p => p.id === selectedPersonId);
    if (!selectedPerson) {
      setIsSubmitting(false);
      return;
    }

    // Создаем транзакцию
    const transaction: Omit<Transaction, 'id'> = {
      standId,
      standNumber: stand.number,
      type: 'выдача',
      responsiblePersonId: selectedPersonId,
      responsiblePersonName: selectedPerson.name,
      recipientName: recipientName.trim(),
      date: new Date()
    };

    const transactionResult = await addTransaction(transaction);

    // Обновляем статус стенда
    const standResult = await updateItem(standId, {
      status: recipientName.trim()
    });

    setIsSubmitting(false);

    if (transactionResult.success && standResult.success) {
      showToast('Стенд успешно выдан', 'success');
      navigate('/scanner');
    } else {
      showToast('Ошибка при выдаче стенда', 'error');
    }
  };

  if (!stand) {
    return (
      <div className="p-4">
        <div className="text-center">Стенд не найден</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {ToastComponent}
      
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/scanner')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Выдать стенд №{stand.number}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация о выдаче</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Кто выдаёт</Label>
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите ответственного" />
                </SelectTrigger>
                <SelectContent>
                  {responsiblePersons.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipient">Кому выдаём</Label>
              <Input
                id="recipient"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Введите имя и фамилию получателя"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !selectedPersonId || !recipientName.trim()}
        >
          {isSubmitting ? 'Выдаём стенд...' : 'Выдать стенд'}
        </Button>
      </form>
    </div>
  );
}
