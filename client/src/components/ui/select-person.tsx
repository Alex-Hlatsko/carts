import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResponsiblePersons } from '@/hooks/useResponsiblePersons';

interface SelectPersonProps {
  onValueChange: (value: string) => void;
  placeholder?: string;
  value?: string;
}

export function SelectPerson({ onValueChange, placeholder = "Выберите ответственного", value }: SelectPersonProps) {
  const { responsiblePersons, loading } = useResponsiblePersons();

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Загрузка..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {responsiblePersons.map((person) => (
          <SelectItem key={person.id} value={person.name}>
            {person.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
