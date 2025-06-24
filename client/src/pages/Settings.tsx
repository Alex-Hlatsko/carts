import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useChecklist } from '../hooks/useChecklist';
import { useResponsiblePersons } from '../hooks/useResponsiblePersons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Settings() {
  const navigate = useNavigate();
  const { checklistItems, addChecklistItem, deleteChecklistItem } = useChecklist();
  const { responsiblePersons, addResponsiblePerson, deleteResponsiblePerson } = useResponsiblePersons();
  const [isChecklistOpen, setIsChecklistOpen] = React.useState(false);
  const [isPersonOpen, setIsPersonOpen] = React.useState(false);
  const [newItem, setNewItem] = React.useState('');
  const [newPerson, setNewPerson] = React.useState('');

  const handleChecklistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    try {
      await addChecklistItem(newItem);
      setNewItem('');
      setIsChecklistOpen(false);
      toast.success('Пункт чек-листа добавлен');
    } catch (error) {
      toast.error('Ошибка при добавлении пункта');
    }
  };

  const handlePersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.trim()) return;
    
    try {
      await addResponsiblePerson(newPerson);
      setNewPerson('');
      setIsPersonOpen(false);
      toast.success('Ответственное лицо добавлено');
    } catch (error) {
      toast.error('Ошибка при добавлении ответственного лица');
    }
  };

  const handleDeleteChecklistItem = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот пункт?')) {
      try {
        await deleteChecklistItem(id);
        toast.success('Пункт чек-листа удален');
      } catch (error) {
        toast.error('Ошибка при удалении пункта');
      }
    }
  };

  const handleDeletePerson = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить это ответственное лицо?')) {
      try {
        await deleteResponsiblePerson(id);
        toast.success('Ответственное лицо удалено');
      } catch (error) {
        toast.error('Ошибка при удалении ответственного лица');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Настройки</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist Settings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Настройки чек-листа</CardTitle>
              <Dialog open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить пункт
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить новый пункт в чек-лист</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChecklistSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="item">Текст пункта</Label>
                      <Input
                        id="item"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Введите текст пункта"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Добавить пункт
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {checklistItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Пункты чек-листа не добавлены</p>
              ) : (
                checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm flex-1">{item.text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responsible Persons Settings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Ответственные лица</CardTitle>
              <Dialog open={isPersonOpen} onOpenChange={setIsPersonOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить лицо
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить ответственное лицо</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePersonSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="person">Имя и фамилия</Label>
                      <Input
                        id="person"
                        value={newPerson}
                        onChange={(e) => setNewPerson(e.target.value)}
                        placeholder="Введите имя и фамилию"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Добавить лицо
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {responsiblePersons.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ответственные лица не добавлены</p>
              ) : (
                responsiblePersons.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm flex-1">{person.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePerson(person.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
