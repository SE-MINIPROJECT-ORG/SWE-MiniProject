import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi.js';
import { validateSignUp, fieldErrors } from '../utils/validation.js';

const EMPTY = { name: '', email: '', password: '', phone: '', role: 'ATTENDEE' };

// Sign-up page (EVT-F-001): a visitor creates an Attendee or Organizer account.
export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    const found = validateSignUp(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await authApi.register({ ...form, email: form.email.trim(), phone: form.phone || undefined });
      navigate('/login', { state: { registered: true, email: form.email.trim() } });
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(err.message);
      setBusy(false);
    }
  };

  return (
    <section className="narrow">
      <h1>Sign up</h1>
      <form className="form" onSubmit={submit} noValidate>
        <label>
          Name
          <input value={form.name} onChange={change('name')} autoComplete="name" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={change('email')} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Password (at least 8 characters, with a letter and a digit)
          <input type="password" value={form.password} onChange={change('password')} autoComplete="new-password" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <label>
          Phone (optional)
          <input type="tel" value={form.phone} onChange={change('phone')} autoComplete="tel" />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </label>
        <fieldset>
          <legend>I want to</legend>
          <label className="inline">
            <input type="radio" name="role" value="ATTENDEE" checked={form.role === 'ATTENDEE'} onChange={change('role')} />
            attend events
          </label>
          <label className="inline">
            <input type="radio" name="role" value="ORGANIZER" checked={form.role === 'ORGANIZER'} onChange={change('role')} />
            organize events
          </label>
        </fieldset>
        {message && (
          <p className="error" role="alert">
            {message}
          </p>
        )}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}
