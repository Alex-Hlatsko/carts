import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';
import { useCollection } from '@/hooks/useFirestore';
import { Responsible, ChecklistItem } from '@/types';
import { Pencil, Trash2, Plus, Settings as SettingsIcon, Users } from 'lucide-react';

export function Settings() {
  const { data: responsibles, addItem: addResponsible, updateItem: updateResponsible, deleteItem: deleteResponsible } = useCollection<Responsible>('responsibles', 'name');
  const { data: checklistItems, addItem: addChecklistItem, updateItem: updateChecklistItem, deleteItem: deleteChecklistItem } = useCollection<ChecklistItem>('checklistItems', 'order');
  
  const [activeTab, setActiveTab] = useState<'checklist' | 'responsibles'>('checklist');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ question: '', name: '' });

  const handleSubmitChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) return;

    const success = editingItem
      ? await updateChecklistItem(editingItem.id, { question: formData.question })
      : await addChecklistItem({ 
          question: formData.question, 
          order: checklistItems.length + 1,
          createdAt: new Date() 
        });

    if (success) {
      setShowToast({ 
        message: editingItem ? 'Пункт обновлен' : 'Пункт добавлен', 
        type: 'success' 
      });
      resetForm();
    } else {
      setShowToast({ message: 'Ошибка при сохранении', type: 'error' });
    }
  };

  const handleSubmitResponsible = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const success = editingItem
      ? await updateResponsible(editingItem.id, { name: formData.name })
      : await addResponsible({ name: formData.name, createdAt: new Date() });

    if (success) {
      setShowToast({ 
        message: editingItem ? 'Ответственный обновлен' : 'Ответственный добавлен', 
        type: 'success' 
      });
      resetForm();
    } else {
      setShowToast({ message: 'Ошибка при сохранении', type: 'error' });
    }
  };

  const handleEdit = (item: any, type: 'checklist' | 'responsible') => {
    setEditingItem(item);
    if (type === 'checklist') {
      setFormData({ question: item.question, name: '' });
    } else {
      setFormData({ question: '', name: item.name });
    }
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string, type: 'checklist' | 'responsible') => {
    const success = type === 'checklist' 
      ? await deleteChecklistItem(id)
      : await deleteResponsible(id);
    
    if (success) {
      setShowToast({ 
        message: type === 'checklist' ? 'Пункт удален' : 'Ответственный удален', 
        type: 'success' 
      });
    } else {
      setShowToast({ message: 'Ошибка при удалении', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ question: '', name: '' });
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };

  return (
    <Layout title="Настройки">
      <div className="space-y-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Button
            variant={activeTab === 'checklist' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('checklist')}
            className="flex-1"
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            Чек-лист
          </Button>
          <Button
            variant={activeTab === 'responsibles' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('responsibles')}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            Ответственные
          </Button>
        </div>

        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить пункт чек-листа
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Редактировать пункт' : 'Добавить пункт чек-листа'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitChecklist} className="space-y-4">
                  <div>
                    <Label htmlFor="question">Вопрос</Label>
                    <Input
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Введите вопрос для проверки..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingItem ? 'Обновить' : 'Добавить'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <p className="text-sm mt-1">{item.question}</p>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item, 'checklist')}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {checklistItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Нет пунктов чек-листа</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'responsibles' && (
          <div className="space-y-4">
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить ответственного
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Редактировать ответственного' : 'Добавить ответственного'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitResponsible} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Имя и фамилия</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Введите имя и фамилию..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingItem ? 'Обновить' : 'Добавить'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="space-y-3">
              {responsibles.map((responsible) => (
                <Card key={responsible.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <p className="font-medium">{responsible.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Добавлен: {new Date(responsible.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(responsible, 'responsible')}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(responsible.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {responsibles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Нет ответственных</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title={activeTab === 'checklist' ? 'Удалить пункт' : 'Удалить ответственного'}
        description={
          activeTab === 'checklist' 
            ? 'Вы уверены, что хотите удалить этот пункт чек-листа?' 
            : 'Вы уверены, что хотите удалить этого ответственного?'
        }
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm, activeTab)}
        variant="destructive"
        confirmText="Удалить"
      />

      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </Layout>
  );
}
