import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggle}
      />
      <span
        className={`flex-1 ${
          todo.completed
            ? 'line-through text-muted-foreground'
            : 'text-foreground'
        }`}
      >
        {todo.text}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}