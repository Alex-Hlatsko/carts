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
    issued_to: '',
    issued_by: ''
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
        stand_id: stand.id,
        type: 'issue',
        issued_to: formData.issued_to,
        issued_by: formData.issued_by,
        received_by: null,
        checklist_data: null,
        notes: null,
        stand_number: stand.number,
        stand_name: stand.name,
        stand_image_url: stand.image_url
      });

      setFormData({ issued_to: '', issued_by: '' });
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
            <Label htmlFor="issued_to">Кому выдается (Имя и Фамилия)</Label>
            <Input
              id="issued_to"
              type="text"
              value={formData.issued_to}
              onChange={(e) => handleChange('issued_to', e.target.value)}
              placeholder="Иван Петров"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="issued_by">Кто выдает</Label>
            <Select onValueChange={(value) => handleChange('issued_by', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ответственного" />
              </SelectTrigger>
              <SelectContent>
                {responsiblePersons.map((person) => (
                  <SelectItem key={person.id} value={`${person.first_name} ${person.last_name}`}>
                    {person.first_name} {person.last_name}
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
