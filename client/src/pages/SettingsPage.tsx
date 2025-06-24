import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { ChecklistItem, ResponsiblePerson } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function SettingsPage() {
  const [newChecklistItem, setNewChecklistItem] = React.useState('');
  const [newResponsiblePerson, setNewResponsiblePerson] = React.useState('');
  const [editingChecklistItem, setEditingChecklistItem] = React.useState<ChecklistItem | null>(null);
  const [editingResponsiblePerson, setEditingResponsiblePerson] = React.useState<ResponsiblePerson | null>(null);
  const [showAddChecklistDialog, setShowAddChecklistDialog] = React.useState(false);
  const [showAddPersonDialog, setShowAddPersonDialog] = React.useState(false);
  const [showEditChecklistDialog, setShowEditChecklistDialog] = React.useState(false);
  const [showEditPersonDialog, setShowEditPersonDialog] = React.useState(false);

  const { 
    data: checklistItems, 
    addItem: addChecklistItem, 
    updateItem: updateChecklistItem, 
    deleteItem: deleteChecklistItem,
    loading: checklistLoading 
  } = useCollection<ChecklistItem>('checklistItems');

  const { 
    data: responsiblePersons, 
    addItem: addResponsiblePerson, 
    updateItem: updateResponsiblePerson, 
    deleteItem: deleteResponsiblePerson,
    loading: personsLoading 
  } = useCollection<ResponsiblePerson>('responsiblePersons');

  const { showSuccess, showError } = useToast();

  const handleAddChecklistItem = React.useCallback(async () => {
    if (!newChecklistItem.trim()) {
      showError('Введите вопрос для чек-листа');
      return;
    }

    const result = await addChecklistItem({
      question: newChecklistItem.trim(),
      order: checklistItems.length
    });

    if (result.success) {
      showSuccess('Пункт чек-листа добавлен');
      setNewChecklistItem('');
      setShowAddChecklistDialog(false);
    } else {
      showError('Ошибка при добавлении пункта');
    }
  }, [newChecklistItem, addChecklistItem, checklistItems.length, showSuccess, showError]);

  const handleEditChecklistItem = React.useCallback(async () => {
    if (!editingChecklistItem || !editingChecklistItem.question.trim()) {
      showError('Введите вопрос для чек-листа');
      return;
    }

    const result = await updateChecklistItem(editingChecklistItem.id, {
      question: editingChecklistItem.question.trim()
    });

    if (result.success) {
      showSuccess('Пункт чек-листа обновлён');
      setEditingChecklistItem(null);
      setShowEditChecklistDialog(false);
    } else {
      showError('Ошибка при обновлении пункта');
    }
  }, [editingChecklistItem, updateChecklistItem, showSuccess, showError]);

  const handleDeleteChecklistItem = React.useCallback(async (item: ChecklistItem) => {
    if (!confirm(`Удалить пункт "${item.question}"?`)) return;

    const result = await deleteChecklistItem(item.id);

    if (result.success) {
      showSuccess('Пункт чек-листа удалён');
    } else {
      showError('Ошибка при удалении пункта');
    }
  }, [deleteChecklistItem, showSuccess, showError]);

  const handleAddResponsiblePerson = React.useCallback(async () => {
    if (!newResponsiblePerson.trim()) {
      showError('Введите имя ответственного');
      return;
    }

    const result = await addResponsiblePerson({
      name: newResponsiblePerson.trim()
    });

    if (result.success) {
      showSuccess('Ответственный добавлен');
      setNewResponsiblePerson('');
      setShowAddPersonDialog(false);
    } else {
      showError('Ошибка при добавлении ответственного');
    }
  }, [newResponsiblePerson, addResponsiblePerson, showSuccess, showError]);

  const handleEditResponsiblePerson = React.useCallback(async () => {
    if (!editingResponsiblePerson || !editingResponsiblePerson.name.trim()) {
      showError('Введите имя ответственного');
      return;
    }

    const result = await updateResponsiblePerson(editingResponsiblePerson.id, {
      name: editingResponsiblePerson.name.trim()
    });

    if (result.success) {
      showSuccess('Ответственный обновлён');
      setEditingResponsiblePerson(null);
      setShowEditPersonDialog(false);
    } else {
      showError('Ошибка при обновлении ответственного');
    }
  }, [editingResponsiblePerson, updateResponsiblePerson, showSuccess, showError]);

  const handleDeleteResponsiblePerson = React.useCallback(async (person: ResponsiblePerson) => {
    if (!confirm(`Удалить ответственного "${person.name}"?`)) return;

    const result = await deleteResponsiblePerson(person.id);

    if (result.success) {
      showSuccess('Ответственный удалён');
    } else {
      showError('Ошибка при удалении ответственного');
    }
  }, [deleteResponsiblePerson, showSuccess, showError]);

  if (checklistLoading || personsLoading) {
    return <div className="container mx-auto p-4">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Checklist Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Пункты чек-листа</CardTitle>
              <Dialog open={showAddChecklistDialog} onOpenChange={setShowAddChecklistDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить пункт чек-листа</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Вопрос</Label>
                      <Input
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="Введите вопрос для проверки"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowAddChecklistDialog(false)} variant="outline" className="flex-1">
                        Отменить
                      </Button>
                      <Button onClick={handleAddChecklistItem} className="flex-1">
                        Добавить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checklistItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{item.question}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingChecklistItem(item);
                        setShowEditChecklistDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteChecklistItem(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {checklistItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Пункты чек-листа не добавлены
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responsible Persons */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Ответственные лица</CardTitle>
              <Dialog open={showAddPersonDialog} onOpenChange={setShowAddPersonDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить ответственного</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Имя и фамилия</Label>
                      <Input
                        value={newResponsiblePerson}
                        onChange={(e) => setNewResponsiblePerson(e.target.value)}
                        placeholder="Введите имя и фамилию"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowAddPersonDialog(false)} variant="outline" className="flex-1">
                        Отменить
                      </Button>
                      <Button onClick={handleAddResponsiblePerson} className="flex-1">
                        Добавить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {responsiblePersons.map(person => (
                <div key={person.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{person.name}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingResponsiblePerson(person);
                        setShowEditPersonDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteResponsiblePerson(person)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {responsiblePersons.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ответственные лица не добавлены
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialogs */}
      <Dialog open={showEditChecklistDialog} onOpenChange={setShowEditChecklistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пункт чек-листа</DialogTitle>
          </DialogHeader>
          {editingChecklistItem && (
            <div className="space-y-4">
              <div>
                <Label>Вопрос</Label>
                <Input
                  value={editingChecklistItem.question}
                  onChange={(e) => setEditingChecklistItem(prev => 
                    prev ? { ...prev, question: e.target.value } : null
                  )}
                  placeholder="Введите вопрос для проверки"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowEditChecklistDialog(false)} variant="outline" className="flex-1">
                  Отменить
                </Button>
                <Button onClick={handleEditChecklistItem} className="flex-1">
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditPersonDialog} onOpenChange={setShowEditPersonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать ответственного</DialogTitle>
          </DialogHeader>
          {editingResponsiblePerson && (
            <div className="space-y-4">
              <div>
                <Label>Имя и фамилия</Label>
                <Input
                  value={editingResponsiblePerson.name}
                  onChange={(e) => setEditingResponsiblePerson(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                  placeholder="Введите имя и фамилию"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowEditPersonDialog(false)} variant="outline" className="flex-1">
                  Отменить
                </Button>
                <Button onClick={handleEditResponsiblePerson} className="flex-1">
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
