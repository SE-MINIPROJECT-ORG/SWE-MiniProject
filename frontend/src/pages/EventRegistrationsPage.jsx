import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { registrationsApi } from '../services/registrationsApi.js';
import { formatDateTime } from '../utils/events.js';
import { countByStatus, statusLabel } from '../utils/registrations.js';

// Organizer's list of registrations for one of their events (EVT-F-027).
export default function EventRegistrationsPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    registrationsApi
      .forEvent(id, token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id, token]);

  if (error) {
    return (
      <section>
        <p className="error">{error}</p>
        <Link to="/organizer">Back to my events</Link>
      </section>
    );
  }
  if (!data) return <p>Loading...</p>;

  const counts = countByStatus(data.registrations);

  return (
    <section>
      <p>
        <Link to="/organizer">Back to my events</Link>
      </p>
      <h1>Registrations: {data.event.title}</h1>
      <p className="muted">
        Confirmed {counts.CONFIRMED} · Checked in {counts.CHECKED_IN} · Waitlisted {counts.WAITLISTED} · Cancelled{' '}
        {counts.CANCELLED}
      </p>
      {data.registrations.length === 0 ? (
        <p>Nobody has registered yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {data.registrations.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>{statusLabel(r)}</span>
                  </td>
                  <td>{formatDateTime(r.registeredAt)}</td>
                  <td className="ticket">{r.ticketId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
