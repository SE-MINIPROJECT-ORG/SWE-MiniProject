import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import EventForm from '../components/EventForm.jsx';
import { eventsApi } from '../services/eventsApi.js';

// Organizer creates an event; it is saved as a draft (EVT-F-010, EVT-F-011).
export default function CreateEventPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const save = async (event) => {
    await eventsApi.create(event, token);
    navigate('/organizer', { state: { created: event.title } });
  };

  return (
    <section className="narrow">
      <h1>Create event</h1>
      <EventForm submitLabel="Save as draft" busyLabel="Saving..." onSave={save} />
    </section>
  );
}
