import * as React from 'react';
import { ReportsList } from '@/components/reports/ReportsList';

export function Reports() {
  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold mb-6">Отчёты</h1>
      <ReportsList />
    </div>
  );
}
