import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stand, ResponsiblePerson } from '@/types';
import { getResponsiblePersons, createTransaction, updateStand } from '@/lib/firestore';

interface IssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  stand: Stand;
}

export function IssueForm({ isOpen, onClose, stand }: IssueFormProps) {
  const [formData, setFormData] = useState({
    issuedTo: '',
    handledBy: ''
  });
  const [responsiblePersons, setResponsiblePersons] = useState<ResponsiblePerson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResponsiblePersons = async () => {
      try {
        const persons = await getResponsiblePersons();
        setResponsiblePersons(persons);
      } catch (error) {
        console.error('Error fetching responsible persons:', error);
      }
    };

    if (isOpen) {
      fetchResponsiblePersons();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update stand status
      await updateStand(stand.id, { status: 'issued' });
      
      // Create transaction record
      await createTransaction({
        standId: stand.id,
        action: 'issue',
        handledBy: formData.handledBy,
        issuedTo: formData.issuedTo
      });

      setFormData({ issuedTo: '', handledBy: '' });
      onClose();
    } catch (error) {
      console.error('Error issuing stand:', error);
      alert('Ошибка при выдаче стенда');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Выдача стенда #{stand.number}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="issuedTo">Кому выдается (Имя и Фамилия)</Label>
            <Input
              id="issuedTo"
              type="text"
              value={formData.issuedTo}
              onChange={(e) => handleChange('issuedTo', e.target.value)}
              placeholder="Иван Петров"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="handledBy">Кто выдает</Label>
            <Select onValueChange={(value) => handleChange('handledBy', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ответственного" />
              </SelectTrigger>
              <SelectContent>
                {responsiblePersons.map((person) => (
                  <SelectItem key={person.id} value={`${person.firstName} ${person.lastName}`}>
                    {person.firstName} {person.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-muted p-3 rounded text-sm">
            <p><strong>Дата и время:</strong> {new Date().toLocaleString('ru-RU')}</p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Выдача...' : 'Выдать стенд'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
