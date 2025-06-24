import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Назад
    </Button>
  );
}
