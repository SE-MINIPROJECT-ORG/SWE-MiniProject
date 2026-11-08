import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import EventForm from '../components/EventForm.jsx';
import { eventsApi } from '../services/eventsApi.js';
import { isoToLocalInput } from '../utils/events.js';

// Organizer edits their own event (EVT-F-012). The server refuses a capacity
// below the confirmed registrations and shows the reason on the form.
export default function EditEventPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [confirmed, setConfirmed] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    eventsApi
      .get(id, token)
      .then(({ event }) => {
        setConfirmed(event.confirmedCount);
        setInitial({
          title: event.title,
          description: event.description || '',
          categoryId: String(event.categoryId),
          venue: event.venue,
          startTime: isoToLocalInput(event.startTime),
          endTime: isoToLocalInput(event.endTime),
          capacity: String(event.capacity),
        });
      })
      .catch((err) => setError(err.message));
  }, [id, token]);

  const save = async (event) => {
    await eventsApi.update(id, event, token);
    navigate('/organizer', { state: { created: null, updated: event.title } });
  };

  if (error) return <p className="error">{error}</p>;
  if (!initial) return <p>Loading...</p>;

  return (
    <section className="narrow">
      <p>
        <Link to="/organizer">Back to my events</Link>
      </p>
      <h1>Edit event</h1>
      <p className="muted">{confirmed} confirmed registrations. Capacity cannot be set lower than this.</p>
      <EventForm initial={initial} submitLabel="Save changes" busyLabel="Saving..." onSave={save} />
    </section>
  );
}
