import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { eventsApi } from '../services/eventsApi.js';
import { localInputToIso, validateEventForm } from '../utils/events.js';
import { fieldErrors } from '../utils/validation.js';

const EMPTY = { title: '', description: '', categoryId: '', venue: '', startTime: '', endTime: '', capacity: '' };

// Organizer creates an event; it is saved as a draft (EVT-F-010, EVT-F-011).
export default function CreateEventPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    eventsApi.categories().then((data) => setCategories(data.categories)).catch(() => setCategories([]));
  }, []);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    const found = validateEventForm(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await eventsApi.create(
        {
          ...form,
          categoryId: Number(form.categoryId),
          capacity: Number(form.capacity),
          startTime: localInputToIso(form.startTime),
          endTime: localInputToIso(form.endTime),
        },
        token
      );
      navigate('/organizer', { state: { created: form.title } });
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(err.message);
      setBusy(false);
    }
  };

  const fieldError = (field) => errors[field] && <span className="field-error">{errors[field]}</span>;

  return (
    <section className="narrow">
      <h1>Create event</h1>
      <form className="form" onSubmit={submit} noValidate>
        <label>
          Title
          <input value={form.title} onChange={change('title')} maxLength={150} />
          {fieldError('title')}
        </label>
        <label>
          Description
          <textarea rows={4} value={form.description} onChange={change('description')} maxLength={2000} />
        </label>
        <label>
          Category
          <select value={form.categoryId} onChange={change('categoryId')}>
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldError('categoryId')}
        </label>
        <label>
          Venue
          <input value={form.venue} onChange={change('venue')} maxLength={200} />
          {fieldError('venue')}
        </label>
        <label>
          Starts
          <input type="datetime-local" value={form.startTime} onChange={change('startTime')} />
          {fieldError('startTime')}
        </label>
        <label>
          Ends
          <input type="datetime-local" value={form.endTime} onChange={change('endTime')} />
          {fieldError('endTime')}
        </label>
        <label>
          Capacity
          <input type="number" min={1} max={10000} value={form.capacity} onChange={change('capacity')} />
          {fieldError('capacity')}
        </label>
        {message && (
          <p className="error" role="alert">
            {message}
          </p>
        )}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Saving...' : 'Save as draft'}
        </button>
      </form>
    </section>
  );
}
