import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { ResponsiblePerson, ResponsiblePersonData } from '@/types';
import { getResponsiblePersons, createResponsiblePerson, updateResponsiblePerson, deleteResponsiblePerson } from '@/lib/firestore';

export function ResponsiblePersonsTab() {
  const [persons, setPersons] = useState<ResponsiblePerson[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ResponsiblePerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ResponsiblePersonData>({
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const data = await getResponsiblePersons();
      setPersons(data);
    } catch (error) {
      console.error('Error fetching responsible persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (person: ResponsiblePerson) => {
    setEditingPerson(person);
    setFormData({
      firstName: person.data.firstName,
      lastName: person.data.lastName
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого ответственного?')) {
      return;
    }

    try {
      await deleteResponsiblePerson(id);
      fetchPersons();
    } catch (error) {
      console.error('Error deleting responsible person:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPerson) {
        await updateResponsiblePerson(editingPerson.id, formData);
      } else {
        await createResponsiblePerson(formData);
      }
      
      handleFormClose();
      fetchPersons();
    } catch (error) {
      console.error('Error saving responsible person:', error);
      alert('Ошибка при сохранении ответственного');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPerson(null);
    setFormData({ firstName: '', lastName: '' });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Ответственные лица</h3>
        <Button onClick={() => setIsFormOpen(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Добавить ответственного
        </Button>
      </div>

      {persons.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Пока нет ответственных лиц</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {persons.map((person) => (
            <div key={person.id} className="border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-medium">{person.data.firstName} {person.data.lastName}</h4>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(person)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit className="w-4 h-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Изменить</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(person.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Удалить</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPerson ? 'Редактировать ответственного' : 'Добавить ответственного'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Имя"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Фамилия"
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleFormClose}>
                Отмена
              </Button>
              <Button type="submit">
                {editingPerson ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
