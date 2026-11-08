import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { eventsApi } from '../services/eventsApi.js';
import { canChangeEvent, formatDateTime } from '../utils/events.js';

// Organizer dashboard: own events in every status, with Publish for drafts (EVT-F-013).
export default function MyEventsPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const state = location.state || {};
  const [message, setMessage] = useState(
    state.created ? `Draft saved: ${state.created}` : state.updated ? `Changes saved: ${state.updated}` : ''
  );
  const [error, setError] = useState('');

  const load = useCallback(() => {
    eventsApi
      .mine(token)
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(load, [load]);

  const publish = async (event) => {
    setError('');
    setMessage('');
    try {
      await eventsApi.publish(event.id, token);
      setMessage(`Published: ${event.title}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Cancelling an event also cancels all its registrations and notifies attendees (EVT-F-014).
  const cancelEvent = async (event) => {
    if (!window.confirm(`Cancel "${event.title}"? All registrations will be cancelled and attendees notified.`)) return;
    setError('');
    setMessage('');
    try {
      const data = await eventsApi.cancel(event.id, token);
      setMessage(`Cancelled: ${event.title} (${data.event.registrationsCancelled} registrations cancelled)`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="title-row">
        <h1>My events</h1>
        <Link className="button-link" to="/organizer/new">
          Create event
        </Link>
      </div>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {events.length === 0 && <p>You have not created any events yet.</p>}
      <div className="card-list">
        {events.map((event) => (
          <article key={event.id} className="card">
            <h2>
              <Link to={`/events/${event.id}`}>{event.title}</Link>
            </h2>
            <p className="muted">
              {formatDateTime(event.startTime)} · {event.venue}
            </p>
            <p>
              Status: <strong>{event.status}</strong> · {event.confirmedCount} of {event.capacity} seats taken
            </p>
            <div className="button-row">
              {event.status === 'PUBLISHED' && (
                <Link className="button-link" to={`/organizer/events/${event.id}/checkin`}>
                  Check-in
                </Link>
              )}
              {event.status !== 'DRAFT' && (
                <Link className="button-link secondary" to={`/organizer/events/${event.id}/registrations`}>
                  Registrations
                </Link>
              )}
              {canChangeEvent(event) && (
                <>
                  <Link className="button-link secondary" to={`/organizer/events/${event.id}/edit`}>
                    Edit
                  </Link>
                  <button type="button" className="danger" onClick={() => cancelEvent(event)}>
                    Cancel event
                  </button>
                </>
              )}
            </div>
            {event.status === 'DRAFT' && (
              <button type="button" className="primary" onClick={() => publish(event)}>
                Publish
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
