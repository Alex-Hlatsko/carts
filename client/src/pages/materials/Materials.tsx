import * as React from 'react';
import { MaterialsList } from '@/components/materials/MaterialsList';
import { AddMaterialDialog } from '@/components/materials/AddMaterialDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Materials() {
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Материалы</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>
      
      <MaterialsList />
      
      <AddMaterialDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
