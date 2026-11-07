import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { registrationsApi } from '../services/registrationsApi.js';
import { formatDateTime } from '../utils/events.js';
import { statusLabel } from '../utils/registrations.js';

// Ticket with a QR code that encodes the ticket ID (EVT-F-026).
export default function TicketPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    registrationsApi
      .ticket(id, token)
      .then((data) => setTicket(data.ticket))
      .catch((err) => setError(err.message));
  }, [id, token]);

  if (error) {
    return (
      <section>
        <p className="error">{error}</p>
        <Link to="/attendee">Back to my registrations</Link>
      </section>
    );
  }
  if (!ticket) return <p>Loading...</p>;

  return (
    <section className="ticket-page">
      <p className="no-print">
        <Link to="/attendee">Back to my registrations</Link>
      </p>
      <h1>{ticket.event.title}</h1>
      <img className="qr" src={ticket.qrCode} alt={`QR code for ticket ${ticket.ticketId}`} width="240" height="240" />
      <p className="ticket-id">{ticket.ticketId}</p>
      <dl className="details">
        <dt>Attendee</dt>
        <dd>{ticket.attendeeName}</dd>
        <dt>When</dt>
        <dd>{formatDateTime(ticket.event.startTime)}</dd>
        <dt>Where</dt>
        <dd>{ticket.event.venue}</dd>
        <dt>Status</dt>
        <dd>{statusLabel(ticket)}</dd>
      </dl>
      <button type="button" className="primary no-print" onClick={() => window.print()}>
        Print ticket
      </button>
    </section>
  );
}
