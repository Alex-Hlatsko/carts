import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, QrCode, ArrowLeft } from 'lucide-react';
import { useStands } from '../hooks/useStands';
import { Stand } from '../types';
import { StandDetailsDialog } from '../components/StandDetailsDialog';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Stands() {
  const navigate = useNavigate();
  const { stands, loading, deleteStand } = useStands();
  const [selectedStand, setSelectedStand] = React.useState<Stand | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteStand(id);
      setDeleteConfirm(null);
      toast.success('Стенд удален');
    } catch (error) {
      toast.error('Ошибка при удалении стенда');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Стенды</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stands.map((stand) => (
          <Card key={stand.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div onClick={() => setSelectedStand(stand)} className="flex-1">
                  <CardTitle className="text-lg">Стенд №{stand.number}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{stand.theme}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(stand.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent onClick={() => setSelectedStand(stand)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Статус:</p>
                  <p className="text-sm text-muted-foreground truncate">{stand.status}</p>
                </div>
                <QrCode className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStand && (
        <StandDetailsDialog
          stand={selectedStand}
          isOpen={!!selectedStand}
          onClose={() => setSelectedStand(null)}
        />
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="mx-4">
          <DialogHeader>
            <DialogTitle>Подтвердите удаление</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Вы уверены, что хотите удалить этот стенд?</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="flex-1"
              >
                Удалить
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
