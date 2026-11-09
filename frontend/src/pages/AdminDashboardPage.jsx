import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { reportsApi } from '../services/reportsApi.js';
import { breakdown } from '../utils/reports.js';

const SECTIONS = [
  { key: 'users', title: 'Users by role', order: ['ATTENDEE', 'ORGANIZER', 'ADMIN'] },
  { key: 'events', title: 'Events by status', order: ['DRAFT', 'PUBLISHED', 'CANCELLED'] },
  { key: 'registrations', title: 'Registrations', order: ['CONFIRMED', 'CHECKED_IN', 'WAITLISTED', 'CANCELLED'] },
];

// Admin dashboard with platform totals (EVT-F-037).
export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi
      .dashboard(token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <section>
      <h1>Admin dashboard</h1>
      <div className="stat-grid">
        {SECTIONS.map((section) => (
          <div key={section.key} className="stat">
            <span className="stat-value">{data[section.key].total}</span>
            <span className="stat-label">{section.title.split(' ')[0]} in total</span>
          </div>
        ))}
      </div>
      <div className="card-list">
        {SECTIONS.map((section) => (
          <article key={section.key} className="card">
            <h2>{section.title}</h2>
            <dl className="details">
              {breakdown(data[section.key], section.order).map((row) => (
                <div key={row.key} className="details-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
