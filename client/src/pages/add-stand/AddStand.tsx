import * as React from 'react';
import { AddStandForm } from '@/components/add-stand/AddStandForm';

export function AddStand() {
  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold mb-6">Добавить стенд</h1>
      <AddStandForm />
    </div>
  );
}
