import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stand, ChecklistItem, ResponsiblePerson } from '@/types';
import { getChecklistSettings, getResponsiblePersons, createTransaction, updateStand } from '@/lib/firestore';

interface ReturnFormProps {
  isOpen: boolean;
  onClose: () => void;
  stand: Stand;
}

export function ReturnForm({ isOpen, onClose, stand }: ReturnFormProps) {
  const [handledBy, setHandledBy] = useState('');
  const [comments, setComments] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklistData, setChecklistData] = useState<Record<string, any>>({});
  const [responsiblePersons, setResponsiblePersons] = useState<ResponsiblePerson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch checklist settings
        const checklistSettings = await getChecklistSettings();
        setChecklistItems(checklistSettings.items);
        
        // Initialize checklist data
        const initialData: Record<string, any> = {};
        checklistSettings.items.forEach((item: ChecklistItem) => {
          initialData[item.id] = true;
          initialData[`${item.id}_comment`] = '';
        });
        setChecklistData(initialData);

        // Fetch responsible persons
        const persons = await getResponsiblePersons();
        setResponsiblePersons(persons);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update stand status
      await updateStand(stand.id, { status: 'В Зале Царства' });
      
      // Create transaction record
      await createTransaction({
        standId: stand.id,
        action: 'receive',
        handledBy: handledBy,
        checklist: checklistData,
        comments: comments || undefined
      });

      setHandledBy('');
      setComments('');
      
      // Reset checklist
      const initialData: Record<string, any> = {};
      checklistItems.forEach(item => {
        initialData[item.id] = true;
        initialData[`${item.id}_comment`] = '';
      });
      setChecklistData(initialData);
      
      onClose();
    } catch (error) {
      console.error('Error returning stand:', error);
      alert('Ошибка при приеме стенда');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistChange = (field: string, value: boolean | string) => {
    setChecklistData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Прием стенда #{stand.number}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="handledBy">Кто принимает</Label>
            <Select onValueChange={setHandledBy} required>
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

          <div className="space-y-4">
            <h3 className="font-semibold">Чек-лист проверки</h3>
            
            {checklistItems.map((item) => (
              <div key={item.id} className="space-y-3 p-4 border rounded">
                <div className="flex items-start gap-3">
                  <div className="flex gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${item.id}_yes`}
                        checked={checklistData[item.id] === true}
                        onCheckedChange={(checked) => 
                          handleChecklistChange(item.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`${item.id}_yes`} className="text-sm">
                        Да
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${item.id}_no`}
                        checked={checklistData[item.id] === false}
                        onCheckedChange={(checked) => 
                          handleChecklistChange(item.id, checked ? false : true)
                        }
                      />
                      <Label htmlFor={`${item.id}_no`} className="text-sm">
                        Нет
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={item.id} className="text-sm font-medium">
                    {item.label}
                  </Label>
                </div>
                
                <div>
                  <Label htmlFor={`${item.id}_comment`} className="text-sm">
                    Комментарий
                  </Label>
                  <Textarea
                    id={`${item.id}_comment`}
                    value={checklistData[`${item.id}_comment`] || ''}
                    onChange={(e) => 
                      handleChecklistChange(`${item.id}_comment`, e.target.value)
                    }
                    placeholder="Добавить комментарий (необязательно)"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="comments">Дополнительные замечания</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Дополнительные замечания (необязательно)"
              rows={3}
            />
          </div>
          
          <div className="bg-muted p-3 rounded text-sm">
            <p><strong>Дата и время:</strong> {new Date().toLocaleString('ru-RU')}</p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Прием...' : 'Принять стенд'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
