import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTodos } from '@/hooks/useTodos';
import { Plus } from 'lucide-react';

export function AddTodoForm() {
  const [text, setText] = React.useState('');
  const { addTodo } = useTodos();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите новую задачу..."
        className="flex-1"
      />
      <Button type="submit" disabled={!text.trim()}>
        <Plus className="h-4 w-4 mr-2" />
        Добавить
      </Button>
    </form>
  );
}