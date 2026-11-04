import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { registrationsApi } from '../services/registrationsApi.js';
import { registerResultMessage } from '../utils/registrations.js';

// One click from the event page to a registration (EVT-F-020, EVT-NF-003).
export default function RegisterButton({ event, onRegistered }) {
  const { role, token } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isOpen = event.status === 'PUBLISHED' && new Date(event.startTime) > new Date();
  if (!isOpen) return null;

  if (role === 'VISITOR') {
    return (
      <p>
        <Link to="/login" state={{ from: location.pathname }}>
          Log in
        </Link>{' '}
        as an attendee to register.
      </p>
    );
  }
  if (role !== 'ATTENDEE') return null;

  const register = async () => {
    setError('');
    setBusy(true);
    try {
      const data = await registrationsApi.register(event.id, token);
      setMessage(registerResultMessage(data.registration));
      if (onRegistered) onRegistered();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="register-box">
      {message ? (
        <p className="success">
          {message} <Link to="/attendee">View my registrations</Link>
        </p>
      ) : (
        <button type="button" className="primary" onClick={register} disabled={busy}>
          {busy ? 'Registering...' : event.seatsLeft > 0 ? 'Register' : 'Join waitlist'}
        </button>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
