import * as React from 'react';
import { StandsList } from '@/components/stands/StandsList';

export function Stands() {
  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold mb-6">Стенды</h1>
      <StandsList />
    </div>
  );
}
