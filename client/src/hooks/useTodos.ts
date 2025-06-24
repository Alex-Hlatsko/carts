import * as React from 'react';
import { Todo } from '@/types/todo';

export function useTodos() {
  const [todos, setTodos] = React.useState<Todo[]>([]);

  // Загружаем задачи из localStorage при инициализации
  React.useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Сохраняем задачи в localStorage при изменении
  React.useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}