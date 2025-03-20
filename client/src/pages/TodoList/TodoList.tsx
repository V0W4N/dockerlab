import { useState, useEffect } from 'react';
import './TodoList.css';

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError('Failed to fetch todos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error('Failed to create todo');
      
      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to create todo');
    }
  };

  const toggleComplete = async (id: number, currentCompleted: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentCompleted })
      });

      if (!response.ok) throw new Error('Failed to update todo');
      
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (err) {
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');
      
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  return (
    <div className="todo-list">
      <h2>Todo List</h2>
      <form onSubmit={handleSubmit} className="todo-form">
        <div className="calculator-input-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="calculator-input-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Todo</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="todo-items">
        {todos.map(todo => (
          <div key={todo.id} className="todo-item">
            <div className="todo-content">
              <h3>{todo.title}</h3>
              <p>{todo.description}</p>
              <div className="todo-date">
                Created: {new Date(todo.created_at).toLocaleString()}
              </div>
            </div>
            <div className="todo-actions">
              <button
                className={todo.completed ? 'completed' : ''}
                onClick={() => toggleComplete(todo.id, todo.completed)}
              >
                {todo.completed ? 'Completed' : 'Mark Complete'}
              </button>
              <button
                className="delete"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 