import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { ResponsiblePerson } from '@/types';
import { getResponsiblePersons, createResponsiblePerson, updateResponsiblePerson, deleteResponsiblePerson } from '@/lib/firestore';

export function ResponsiblePersonsTab() {
  const [persons, setPersons] = useState<ResponsiblePerson[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ResponsiblePerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: ''
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
      first_name: person.first_name,
      last_name: person.last_name
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
    setFormData({ first_name: '', last_name: '' });
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ответственные лица</h3>
        <Button onClick={() => setIsFormOpen(true)}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {persons.map((person) => (
            <div key={person.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{person.first_name} {person.last_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Добавлен {new Date(person.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(person)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(person.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPerson ? 'Редактировать ответственного' : 'Добавить ответственного'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="first_name">Имя</Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Имя"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="last_name">Фамилия</Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Фамилия"
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
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
