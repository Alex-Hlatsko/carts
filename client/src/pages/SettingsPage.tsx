import * as React from 'react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/toast';
import { ChecklistItem, Responsible } from '@/types';
import { Plus, Trash2, Edit } from 'lucide-react';

export function SettingsPage() {
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [editingResponsible, setEditingResponsible] = useState<Responsible | null>(null);
  const [editName, setEditName] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [isAddingResponsible, setIsAddingResponsible] = useState(false);
  const [isEditingResponsible, setIsEditingResponsible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: checklistItems, add: addChecklistItem, remove: removeChecklistItem } = useCollection<ChecklistItem>('checklist');
  const { data: responsibles, add: addResponsible, update: updateResponsible, remove: removeResponsible } = useCollection<Responsible>('responsibles');
  const { toasts, removeToast, success, error } = useToast();

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) {
      error('Введите текст вопроса');
      return;
    }

    setIsSubmitting(true);
    try {
      const item: Omit<ChecklistItem, 'id'> = {
        question: newChecklistItem.trim(),
        order: checklistItems.length + 1,
      };

      const result = await addChecklistItem(item);
      if (result) {
        success('Пункт чек-листа добавлен');
        setNewChecklistItem('');
        setIsAddingChecklist(false);
      } else {
        error('Ошибка при добавлении пункта');
      }
    } catch (err) {
      error('Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveChecklistItem = async (item: ChecklistItem) => {
    if (confirm(`Удалить вопрос: "${item.question}"?`)) {
      const result = await removeChecklistItem(item.id);
      if (result) {
        success('Пункт чек-листа удалён');
      } else {
        error('Ошибка при удалении пункта');
      }
    }
  };

  const handleAddResponsible = async () => {
    if (!newResponsible.trim()) {
      error('Введите имя ответственного');
      return;
    }

    setIsSubmitting(true);
    try {
      const responsible: Omit<Responsible, 'id'> = {
        name: newResponsible.trim(),
      };

      const result = await addResponsible(responsible);
      if (result) {
        success('Ответственный добавлен');
        setNewResponsible('');
        setIsAddingResponsible(false);
      } else {
        error('Ошибка при добавлении ответственного');
      }
    } catch (err) {
      error('Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResponsible = (responsible: Responsible) => {
    setEditingResponsible(responsible);
    setEditName(responsible.name);
    setIsEditingResponsible(true);
  };

  const handleUpdateResponsible = async () => {
    if (!editName.trim() || !editingResponsible) {
      error('Введите имя ответственного');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateResponsible(editingResponsible.id, { name: editName.trim() });
      if (result) {
        success('Ответственный обновлён');
        setIsEditingResponsible(false);
        setEditingResponsible(null);
        setEditName('');
      } else {
        error('Ошибка при обновлении ответственного');
      }
    } catch (err) {
      error('Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveResponsible = async (responsible: Responsible) => {
    if (confirm(`Удалить ответственного: "${responsible.name}"?`)) {
      const result = await removeResponsible(responsible.id);
      if (result) {
        success('Ответственный удалён');
      } else {
        error('Ошибка при удалении ответственного');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Настройки</h2>

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checklist">Чек-лист</TabsTrigger>
          <TabsTrigger value="responsibles">Ответственные</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Пункты чек-листа</h3>
            <Dialog open={isAddingChecklist} onOpenChange={setIsAddingChecklist}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить пункт
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить пункт чек-листа</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Вопрос</Label>
                    <Input
                      id="question"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Введите вопрос для проверки"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddChecklistItem} 
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Добавление...' : 'Добавить'}
                    </Button>
                    <Button 
                      onClick={() => setIsAddingChecklist(false)} 
                      variant="outline"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {checklistItems.map((item, index) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                      <p className="font-medium">{item.question}</p>
                    </div>
                    <Button
                      onClick={() => handleRemoveChecklistItem(item)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {checklistItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Нет пунктов чек-листа. Добавьте первый пункт.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="responsibles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ответственные лица</h3>
            <Dialog open={isAddingResponsible} onOpenChange={setIsAddingResponsible}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить ответственного
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить ответственного</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Имя и фамилия</Label>
                    <Input
                      id="name"
                      value={newResponsible}
                      onChange={(e) => setNewResponsible(e.target.value)}
                      placeholder="Введите имя и фамилию"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddResponsible} 
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Добавление...' : 'Добавить'}
                    </Button>
                    <Button 
                      onClick={() => setIsAddingResponsible(false)} 
                      variant="outline"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {responsibles.map((responsible) => (
              <Card key={responsible.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{responsible.name}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditResponsible(responsible)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleRemoveResponsible(responsible)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {responsibles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Нет ответственных лиц. Добавьте первого ответственного.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditingResponsible} onOpenChange={setIsEditingResponsible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать ответственного</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Имя и фамилия</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Введите имя и фамилию"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdateResponsible} 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button 
                onClick={() => setIsEditingResponsible(false)} 
                variant="outline"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
