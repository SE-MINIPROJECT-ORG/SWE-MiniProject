import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../services/eventsApi.js';
import { formatDateTime, localInputToIso, seatsText } from '../utils/events.js';

const NO_FILTERS = { q: '', categoryId: '', from: '', to: '' };

// Browse, search and filter published events, 10 per page (EVT-F-016).
export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(NO_FILTERS);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    eventsApi.categories().then((data) => setCategories(data.categories)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setError('');
    eventsApi
      .search({ ...filters, from: localInputToIso(filters.from), to: localInputToIso(filters.to), page })
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [filters, page]);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const apply = (e) => {
    e.preventDefault();
    setPage(1);
    setFilters(form);
  };
  const clear = () => {
    setForm(NO_FILTERS);
    setFilters(NO_FILTERS);
    setPage(1);
  };

  return (
    <section>
      <h1>Upcoming events</h1>
      <form className="filters" onSubmit={apply}>
        <input placeholder="Search title or description" value={form.q} onChange={change('q')} aria-label="Search" />
        <select value={form.categoryId} onChange={change('categoryId')} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label>
          From <input type="datetime-local" value={form.from} onChange={change('from')} />
        </label>
        <label>
          To <input type="datetime-local" value={form.to} onChange={change('to')} />
        </label>
        <button type="submit" className="primary">
          Search
        </button>
        <button type="button" onClick={clear}>
          Clear
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {result && result.items.length === 0 && <p>No events match your search.</p>}

      <div className="card-list">
        {result &&
          result.items.map((event) => (
            <article key={event.id} className="card">
              <h2>
                <Link to={`/events/${event.id}`}>{event.title}</Link>
              </h2>
              <p className="muted">
                {formatDateTime(event.startTime)} · {event.venue} · {event.categoryName}
              </p>
              <p>{seatsText(event)}</p>
            </article>
          ))}
      </div>

      {result && result.totalPages > 1 && (
        <nav className="pagination" aria-label="Pages">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            Page {result.page} of {result.totalPages}
          </span>
          <button type="button" disabled={page >= result.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
