import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import RegisterButton from '../components/RegisterButton.jsx';
import { eventsApi } from '../services/eventsApi.js';
import { formatDateTime, seatsText } from '../utils/events.js';

export default function EventDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    eventsApi
      .get(id, token)
      .then((data) => setEvent(data.event))
      .catch((err) => setError(err.status === 404 ? 'Event not found.' : err.message));
  }, [id, token]);

  useEffect(load, [load]);

  if (error) {
    return (
      <section>
        <p className="error">{error}</p>
        <Link to="/">Back to events</Link>
      </section>
    );
  }
  if (!event) return <p>Loading...</p>;

  return (
    <section>
      <h1>{event.title}</h1>
      {event.status !== 'PUBLISHED' && <p className="status-note">Status: {event.status}</p>}
      <dl className="details">
        <dt>When</dt>
        <dd>
          {formatDateTime(event.startTime)} to {formatDateTime(event.endTime)}
        </dd>
        <dt>Where</dt>
        <dd>{event.venue}</dd>
        <dt>Category</dt>
        <dd>{event.categoryName}</dd>
        <dt>Organizer</dt>
        <dd>{event.organizerName}</dd>
        <dt>Seats</dt>
        <dd>{seatsText(event)}</dd>
      </dl>
      {event.description && <p className="description">{event.description}</p>}
      <RegisterButton event={event} onRegistered={load} />
    </section>
  );
}
