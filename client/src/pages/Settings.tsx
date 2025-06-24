import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection } from '@/hooks/useFirestore';
import { ChecklistItem, ResponsiblePerson } from '@/types';
import { useToast, Toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Trash2, Settings as SettingsIcon, Users, FileCheck } from 'lucide-react';

export function Settings() {
  const [showChecklistDialog, setShowChecklistDialog] = useState(false);
  const [showPeopleDialog, setShowPeopleDialog] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [deleteChecklistDialog, setDeleteChecklistDialog] = useState<{ open: boolean; itemId: string }>({
    open: false,
    itemId: ''
  });
  const [deletePersonDialog, setDeletePersonDialog] = useState<{ open: boolean; personId: string }>({
    open: false,
    personId: ''
  });

  const { data: checklistItems, add: addChecklistItem, remove: removeChecklistItem } = useCollection<ChecklistItem>('checklist');
  const { data: responsiblePeople, add: addResponsiblePerson, remove: removeResponsiblePerson } = useCollection<ResponsiblePerson>('responsiblePeople');
  const { toast, showToast, hideToast } = useToast();

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) {
      showToast('Введите текст пункта', 'error');
      return;
    }

    const nextOrder = Math.max(...checklistItems.map(item => item.order), 0) + 1;
    
    const result = await addChecklistItem({
      text: newChecklistItem.trim(),
      order: nextOrder,
      createdAt: new Date()
    });

    if (result.success) {
      showToast('Пункт чек-листа добавлен', 'success');
      setNewChecklistItem('');
      setShowChecklistDialog(false);
    } else {
      showToast('Ошибка при добавлении пункта', 'error');
    }
  };

  const handleDeleteChecklistItem = async () => {
    const result = await removeChecklistItem(deleteChecklistDialog.itemId);
    if (result.success) {
      showToast('Пункт чек-листа удалён', 'success');
    } else {
      showToast('Ошибка при удалении пункта', 'error');
    }
  };

  const handleAddResponsiblePerson = async () => {
    if (!newPersonName.trim()) {
      showToast('Введите имя ответственного', 'error');
      return;
    }

    const result = await addResponsiblePerson({
      name: newPersonName.trim(),
      createdAt: new Date()
    });

    if (result.success) {
      showToast('Ответственный добавлен', 'success');
      setNewPersonName('');
      setShowPeopleDialog(false);
    } else {
      showToast('Ошибка при добавлении ответственного', 'error');
    }
  };

  const handleDeleteResponsiblePerson = async () => {
    const result = await removeResponsiblePerson(deletePersonDialog.personId);
    if (result.success) {
      showToast('Ответственный удалён', 'success');
    } else {
      showToast('Ошибка при удалении ответственного', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <SettingsIcon className="w-8 h-8 mr-3" />
        <h1 className="text-3xl font-bold">Настройки</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checklist Settings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <FileCheck className="w-5 h-5 mr-2" />
                Чек-лист
              </CardTitle>
              <Dialog open={showChecklistDialog} onOpenChange={setShowChecklistDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить пункт
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить пункт чек-листа</DialogTitle>
                    <DialogDescription>
                      Введите текст нового пункта для чек-листа
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="checklistText">Текст пункта</Label>
                      <Input
                        id="checklistText"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="Введите текст пункта чек-листа"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowChecklistDialog(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddChecklistItem}>
                      Добавить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {checklistItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Нет пунктов в чек-листе
              </p>
            ) : (
              <div className="space-y-2">
                {checklistItems
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span className="text-sm">{item.text}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteChecklistDialog({ open: true, itemId: item.id })}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Responsible People Settings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Ответственные
              </CardTitle>
              <Dialog open={showPeopleDialog} onOpenChange={setShowPeopleDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить ответственного</DialogTitle>
                    <DialogDescription>
                      Введите имя и фамилию ответственного лица
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="personName">Имя и фамилия</Label>
                      <Input
                        id="personName"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        placeholder="Введите имя и фамилию"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPeopleDialog(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddResponsiblePerson}>
                      Добавить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {responsiblePeople.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Нет ответственных лиц
              </p>
            ) : (
              <div className="space-y-2">
                {responsiblePeople.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">{person.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletePersonDialog({ open: true, personId: person.id })}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={deleteChecklistDialog.open}
        onOpenChange={(open) => setDeleteChecklistDialog({ open, itemId: '' })}
        title="Удалить пункт чек-листа"
        description="Вы уверены, что хотите удалить этот пункт из чек-листа?"
        onConfirm={handleDeleteChecklistItem}
      />

      <ConfirmDialog
        open={deletePersonDialog.open}
        onOpenChange={(open) => setDeletePersonDialog({ open, personId: '' })}
        title="Удалить ответственного"
        description="Вы уверены, что хотите удалить этого ответственного?"
        onConfirm={handleDeleteResponsiblePerson}
      />

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
