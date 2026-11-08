import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { eventsApi } from '../services/eventsApi.js';

// Admin adds, renames and deletes event categories (EVT-F-015).
export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    eventsApi
      .categories()
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  const run = async (action, success) => {
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(success);
      load();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const add = async (e) => {
    e.preventDefault();
    if (await run(() => eventsApi.createCategory(newName, token), `Added: ${newName.trim()}`)) setNewName('');
  };

  const rename = async (e) => {
    e.preventDefault();
    if (await run(() => eventsApi.renameCategory(editing.id, editing.name, token), `Renamed to: ${editing.name.trim()}`)) {
      setEditing(null);
    }
  };

  const remove = (category) => {
    if (!window.confirm(`Delete the category "${category.name}"?`)) return;
    run(() => eventsApi.deleteCategory(category.id, token), `Deleted: ${category.name}`);
  };

  return (
    <section className="narrow">
      <h1>Categories</h1>
      <form className="inline-form" onSubmit={add}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category" maxLength={50} aria-label="New category name" />
        <button type="submit" className="primary" disabled={!newName.trim()}>
          Add
        </button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <ul className="plain-list">
        {categories.map((category) => (
          <li key={category.id}>
            {editing && editing.id === category.id ? (
              <form className="inline-form" onSubmit={rename}>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  maxLength={50}
                  aria-label="Category name"
                  autoFocus
                />
                <button type="submit" className="primary">
                  Save
                </button>
                <button type="button" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span>{category.name}</span>
                <span className="actions">
                  <button type="button" onClick={() => setEditing({ id: category.id, name: category.name })}>
                    Rename
                  </button>
                  <button type="button" className="danger" onClick={() => remove(category)}>
                    Delete
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
