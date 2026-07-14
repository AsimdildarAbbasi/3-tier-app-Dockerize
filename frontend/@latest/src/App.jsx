import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState('connecting');

const API_URL = "http://13.235.94.22:5000/api/todos";
const TEST_URL = "http://13.235.94.22:5000/db-test";

  // Function to verify API & DB connection
  const checkConnection = async () => {
    try {
      const res = await fetch(TEST_URL);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDbStatus('connected');
        return true;
      } else {
        setDbStatus('db_error');
        setError(data.error || data.message || 'Database error');
        return false;
      }
    } catch (err) {
      setDbStatus('offline');
      setError('Backend server offline (run node server.js on port 3000)');
      return false;
    }
  };

  // Fetch all tasks from the DB
  const fetchTodos = async () => {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        setLoading(false);
        return;
      }
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Could not retrieve tasks from database.');
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    // Poll the backend status every 5 seconds to show real-time connection health
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add a task
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodoText })
      });
      if (!res.ok) throw new Error('Failed to create task.');
      const added = await res.json();
      setTodos((prev) => [...prev, added]);
      setNewTodoText('');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle completion status
  const handleToggleTodo = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      if (!res.ok) throw new Error('Failed to update task status.');
      const updated = await res.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updated : todo))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Save edited task title
  const handleSaveEdit = async (id) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingText })
      });
      if (!res.ok) throw new Error('Failed to save task.');
      const updated = await res.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updated : todo))
      );
      setEditingId(null);
      setEditingText('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a task
  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task.');
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="todo-app">
      <header className="todo-header">
        <h1>Task Manager by Asim Dildar Abbasi</h1>
        <div className="status-indicator">
          <span className={`status-dot ${dbStatus}`}></span>
          <span className="status-text">
            {dbStatus === 'connected' && 'Database Connected'}
            {dbStatus === 'db_error' && 'Database Auth Error'}
            {dbStatus === 'offline' && 'Backend Server Offline'}
            {dbStatus === 'connecting' && 'Connecting...'}
          </span>
        </div>
      </header>

      {error && (
        <div className="alert alert-error">
          <strong>Connection Alert:</strong> {error}
        </div>
      )}

      <main className="todo-container">
        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            disabled={dbStatus !== 'connected'}
          />
          <button type="submit" disabled={dbStatus !== 'connected'}>
            Add Task
          </button>
        </form>

        {loading ? (
          <div className="loader">Loading tasks...</div>
        ) : (
          <ul className="todo-list">
            {todos.length === 0 ? (
              <li className="todo-empty">No tasks yet. Enjoy your day!</li>
            ) : (
              todos.map((todo) => (
                <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <div className="todo-item-main">
                    <button
                      type="button"
                      className="todo-checkbox"
                      onClick={() => handleToggleTodo(todo.id, todo.completed)}
                      aria-label="Toggle Complete"
                    >
                      {todo.completed && <span className="checkmark">✓</span>}
                    </button>

                    {editingId === todo.id ? (
                      <input
                        type="text"
                        className="todo-edit-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(todo.id)}
                        autoFocus
                      />
                    ) : (
                      <span className="todo-title">{todo.title}</span>
                    )}
                  </div>

                  <div className="todo-actions">
                    {editingId === todo.id ? (
                      <>
                        <button
                          type="button"
                          className="btn-action save"
                          onClick={() => handleSaveEdit(todo.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn-action cancel"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-action edit"
                          onClick={() => {
                            setEditingId(todo.id);
                            setEditingText(todo.title);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action delete"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </main>
    </div>
  );
}

export default App;
