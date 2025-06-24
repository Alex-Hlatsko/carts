import React, { useState } from 'react';
import { useCollection } from '@/hooks/useFirestore';
import { ChecklistItem, ResponsiblePerson } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';

export function Settings() {
  const { data: checklistItems, addItem: addChecklistItem, updateItem: updateChecklistItem, deleteItem: deleteChecklistItem } = useCollection<ChecklistItem>('checklist-items');
  const { data: responsiblePersons, addItem: addPerson, updateItem: updatePerson, deleteItem: deletePerson } = useCollection<ResponsiblePerson>('responsible-persons');
  
  const [showChecklistDialog, setShowChecklistDialog] = useState(false);
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistItem | null>(null);
  const [editingPerson, setEditingPerson] = useState<ResponsiblePerson | null>(null);
  const [deleteChecklistId, setDeleteChecklistId] = useState<string | null>(null);
  const [deletePersonId, setDeletePersonId] = useState<string | null>(null);
  
  const [checklistQuestion, setChecklistQuestion] = useState('');
  const [personName, setPersonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { showToast, ToastComponent } = useToast();

  // Сортированные пункты чек-листа
  const sortedChecklistItems = [...checklistItems].sort((a, b) => a.order - b.order);

  const handleSubmitChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistQuestion.trim()) return;

    setIsSubmitting(true);

    let result;
    if (editingChecklistItem) {
      result = await updateChecklistItem(editingChecklistItem.id, {
        question: checklistQuestion.trim()
      });
    } else {
      const maxOrder = checklistItems.length > 0 ? Math.max(...checklistItems.map(item => item.order)) : 0;
      result = await addChecklistItem({
        question: checklistQuestion.trim(),
        order: maxOrder + 1
      });
    }

    setIsSubmitting(false);

    if (result.success) {
      showToast(
        editingChecklistItem ? 'Пункт чек-листа обновлен' : 'Пункт чек-листа добавлен',
        'success'
      );
      handleCloseChecklistDialog();
    } else {
      showToast('Ошибка при сохранении пункта', 'error');
    }
  };

  const handleSubmitPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    setIsSubmitting(true);

    let result;
    if (editingPerson) {
      result = await updatePerson(editingPerson.id, {
        name: personName.trim()
      });
    } else {
      result = await addPerson({
        name: personName.trim()
      });
    }

    setIsSubmitting(false);

    if (result.success) {
      showToast(
        editingPerson ? 'Ответственный обновлен' : 'Ответственный добавлен',
        'success'
      );
      handleClosePersonDialog();
    } else {
      showToast('Ошибка при сохранении ответственного', 'error');
    }
  };

  const handleEditChecklistItem = (item: ChecklistItem) => {
    setEditingChecklistItem(item);
    setChecklistQuestion(item.question);
    setShowChecklistDialog(true);
  };

  const handleEditPerson = (person: ResponsiblePerson) => {
    setEditingPerson(person);
    setPersonName(person.name);
    setShowPersonDialog(true);
  };

  const handleDeleteChecklistItem = async (id: string) => {
    const result = await deleteChecklistItem(id);
    if (result.success) {
      showToast('Пункт чек-листа удален', 'success');
    } else {
      showToast('Ошибка при удалении пункта', 'error');
    }
    setDeleteChecklistId(null);
  };

  const handleDeletePerson = async (id: string) => {
    const result = await deletePerson(id);
    if (result.success) {
      showToast('Ответственный удален', 'success');
    } else {
      showToast('Ошибка при удалении ответственного', 'error');
    }
    setDeletePersonId(null);
  };

  const moveChecklistItem = async (id: string, direction: 'up' | 'down') => {
    const item = sortedChecklistItems.find(item => item.id === id);
    if (!item) return;

    const currentIndex = sortedChecklistItems.findIndex(item => item.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sortedChecklistItems.length) return;

    const otherItem = sortedChecklistItems[newIndex];

    await updateChecklistItem(item.id, { order: otherItem.order });
    await updateChecklistItem(otherItem.id, { order: item.order });
  };

  const handleCloseChecklistDialog = () => {
    setShowChecklistDialog(false);
    setEditingChecklistItem(null);
    setChecklistQuestion('');
  };

  const handleClosePersonDialog = () => {
    setShowPersonDialog(false);
    setEditingPerson(null);
    setPersonName('');
  };

  return (
    <div className="p-4 space-y-6">
      {ToastComponent}
      
      <h1 className="text-2xl font-bold">Настройки</h1>

      {/* Чек-лист */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Чек-лист для приёма</CardTitle>
            <Button onClick={() => setShowChecklistDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedChecklistItems.length === 0 ? (
            <p className="text-gray-500">Пункты чек-листа отсутствуют</p>
          ) : (
            <div className="space-y-2">
              {sortedChecklistItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveChecklistItem(item.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveChecklistItem(item.id, 'down')}
                      disabled={index === sortedChecklistItems.length - 1}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <span className="flex-1 text-sm">{item.question}</span>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleEditChecklistItem(item)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setDeleteChecklistId(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ответственные */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ответственные лица</CardTitle>
            <Button onClick={() => setShowPersonDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {responsiblePersons.length === 0 ? (
            <p className="text-gray-500">Ответственные лица отсутствуют</p>
          ) : (
            <div className="space-y-2">
              {responsiblePersons.map((person) => (
                <div key={person.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{person.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleEditPerson(person)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setDeletePersonId(person.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления/редактирования пункта чек-листа */}
      <Dialog open={showChecklistDialog} onOpenChange={(open) => !open && handleCloseChecklistDialog()}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingChecklistItem ? 'Редактировать пункт' : 'Добавить пункт чек-листа'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitChecklist} className="space-y-4">
            <div>
              <Label htmlFor="question">Вопрос</Label>
              <Input
                id="question"
                value={checklistQuestion}
                onChange={(e) => setChecklistQuestion(e.target.value)}
                placeholder="Введите вопрос для проверки"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCloseChecklistDialog}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог добавления/редактирования ответственного */}
      <Dialog open={showPersonDialog} onOpenChange={(open) => !open && handleClosePersonDialog()}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingPerson ? 'Редактировать ответственного' : 'Добавить ответственного'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPerson} className="space-y-4">
            <div>
              <Label htmlFor="name">Имя и фамилия</Label>
              <Input
                id="name"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Введите имя и фамилию"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClosePersonDialog}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалоги подтверждения удаления */}
      <ConfirmationDialog
        open={deleteChecklistId !== null}
        onOpenChange={(open) => !open && setDeleteChecklistId(null)}
        title="Удаление пункта чек-листа"
        description="Вы уверены, что хотите удалить этот пункт? Это действие нельзя отменить."
        onConfirm={() => deleteChecklistId && handleDeleteChecklistItem(deleteChecklistId)}
        confirmText="Удалить"
        variant="destructive"
      />

      <ConfirmationDialog
        open={deletePersonId !== null}
        onOpenChange={(open) => !open && setDeletePersonId(null)}
        title="Удаление ответственного"
        description="Вы уверены, что хотите удалить этого ответственного? Это действие нельзя отменить."
        onConfirm={() => deletePersonId && handleDeletePerson(deletePersonId)}
        confirmText="Удалить"
        variant="destructive"
      />
    </div>
  );
}
