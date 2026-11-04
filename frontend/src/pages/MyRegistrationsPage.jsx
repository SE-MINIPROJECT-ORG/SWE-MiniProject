import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { registrationsApi } from '../services/registrationsApi.js';
import { formatDateTime } from '../utils/events.js';
import { canCancel, statusLabel } from '../utils/registrations.js';

// The attendee's own registrations with status, and Cancel (EVT-F-025, EVT-F-023).
export default function MyRegistrationsPage() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    registrationsApi
      .mine(token)
      .then((data) => setRegistrations(data.registrations))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(load, [load]);

  const cancel = async (registration) => {
    if (!window.confirm(`Cancel your registration for "${registration.event.title}"?`)) return;
    setError('');
    setMessage('');
    try {
      await registrationsApi.cancel(registration.id, token);
      setMessage(`Cancelled: ${registration.event.title}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h1>My registrations</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {registrations && registrations.length === 0 && (
        <p>
          You have no registrations yet. <Link to="/">Browse events</Link>
        </p>
      )}
      <div className="card-list">
        {(registrations || []).map((registration) => (
          <article key={registration.id} className="card">
            <h2>
              <Link to={`/events/${registration.event.id}`}>{registration.event.title}</Link>
            </h2>
            <p className="muted">
              {formatDateTime(registration.event.startTime)} · {registration.event.venue}
            </p>
            <p>
              <span className={`badge badge-${registration.status.toLowerCase()}`}>{statusLabel(registration)}</span>
              {registration.status === 'CONFIRMED' && <span className="ticket"> Ticket: {registration.ticketId}</span>}
            </p>
            {canCancel(registration) && (
              <button type="button" className="danger" onClick={() => cancel(registration)}>
                Cancel registration
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
