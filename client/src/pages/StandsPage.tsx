import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StandCard } from '@/components/stands/StandCard';
import { QRCodeDialog } from '@/components/stands/QRCodeDialog';
import { StandDetailDialog } from '@/components/stands/StandDetailDialog';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Stand } from '@/types';
import { Search } from 'lucide-react';

export function StandsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStand, setSelectedStand] = React.useState<Stand | null>(null);
  const [qrStand, setQrStand] = React.useState<Stand | null>(null);
  const [showDetail, setShowDetail] = React.useState(false);
  const [showQR, setShowQR] = React.useState(false);

  const { data: stands, deleteItem, loading } = useCollection<Stand>('stands');
  const { showSuccess, showError } = useToast();

  const filteredStands = React.useMemo(() => {
    return stands.filter(stand => 
      stand.number.toString().includes(searchTerm) ||
      stand.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stand.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stands, searchTerm]);

  const handleEdit = React.useCallback((stand: Stand) => {
    // Navigate to edit page (implement later)
    console.log('Edit stand:', stand);
  }, []);

  const handleDelete = React.useCallback(async (stand: Stand) => {
    if (!confirm(`Удалить стенд #${stand.number}?`)) return;

    const result = await deleteItem(stand.id);

    if (result.success) {
      showSuccess('Стенд удалён');
    } else {
      showError('Ошибка при удалении стенда');
    }
  }, [deleteItem, showSuccess, showError]);

  const handleShowQR = React.useCallback((stand: Stand) => {
    setQrStand(stand);
    setShowQR(true);
  }, []);

  const handleStandClick = React.useCallback((stand: Stand) => {
    setSelectedStand(stand);
    setShowDetail(true);
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Стенды</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру, теме или статусу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStands.map(stand => (
          <StandCard
            key={stand.id}
            stand={stand}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShowQR={handleShowQR}
            onClick={handleStandClick}
          />
        ))}
      </div>

      {filteredStands.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? 'Стенды не найдены' : 'Стенды не найдены'}
          </p>
        </div>
      )}

      <QRCodeDialog
        open={showQR}
        onClose={() => setShowQR(false)}
        stand={qrStand}
      />

      <StandDetailDialog
        open={showDetail}
        onClose={() => setShowDetail(false)}
        stand={selectedStand}
      />
    </div>
  );
}
