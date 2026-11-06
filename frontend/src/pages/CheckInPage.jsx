import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { checkinApi } from '../services/checkinApi.js';
import { eventsApi } from '../services/eventsApi.js';
import { formatDateTime } from '../utils/events.js';

// Organizer checks in attendees by typing or scanning the ticket ID (EVT-F-030, EVT-F-031).
// A barcode or QR scanner that types like a keyboard works in the same box, so no camera is needed.
export default function CheckInPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    eventsApi
      .get(id, token)
      .then((data) => setEvent(data.event))
      .catch((err) => setError(err.message));
  }, [id, token]);

  const submit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    setBusy(true);
    try {
      setResult(await checkinApi.checkIn(id, ticketId, token));
      setTicketId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="narrow">
      <p>
        <Link to="/organizer">Back to my events</Link>
      </p>
      <h1>Check-in</h1>
      {event && (
        <p className="muted">
          {event.title} · {formatDateTime(event.startTime)}
        </p>
      )}
      <form className="form" onSubmit={submit}>
        <label>
          Ticket ID
          <input value={ticketId} onChange={(e) => setTicketId(e.target.value)} placeholder="TKT-..." autoFocus />
        </label>
        <button type="submit" className="primary" disabled={busy || !ticketId.trim()}>
          {busy ? 'Checking...' : 'Check in'}
        </button>
      </form>
      {result && (
        <p className="success" role="status">
          Checked in: <strong>{result.attendeeName}</strong> ({result.ticketId}) at {formatDateTime(result.checkedInAt)}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
