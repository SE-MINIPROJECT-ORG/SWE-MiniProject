import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { usersApi } from '../services/usersApi.js';
import { fieldErrors, validatePasswordChange } from '../utils/validation.js';

const NO_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };

// View and update name and phone, and change the password with the current one (EVT-F-007).
export default function ProfilePage() {
  const { token, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileErrors, setProfileErrors] = useState({});
  const [passwords, setPasswords] = useState(NO_PASSWORDS);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi
      .me(token)
      .then(({ user }) => setProfile({ name: user.name, phone: user.phone || '', email: user.email, role: user.role }))
      .catch((err) => setError(err.message));
  }, [token]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileErrors({});
    try {
      const { user } = await usersApi.updateMe({ name: profile.name, phone: profile.phone || undefined }, token);
      updateUser({ name: user.name, phone: user.phone });
      setProfileMessage('Profile saved.');
    } catch (err) {
      setProfileErrors({ ...fieldErrors(err), form: err.message });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    const found = validatePasswordChange(passwords);
    setPasswordErrors(found);
    if (Object.keys(found).length) return;
    try {
      await usersApi.changePassword(passwords.currentPassword, passwords.newPassword, token);
      setPasswords(NO_PASSWORDS);
      setPasswordMessage('Password changed.');
    } catch (err) {
      setPasswordErrors({ ...fieldErrors(err), form: err.message });
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!profile) return <p>Loading...</p>;

  const pw = (field) => (e) => setPasswords({ ...passwords, [field]: e.target.value });

  return (
    <section className="narrow">
      <h1>My profile</h1>
      <p className="muted">
        {profile.email} · {profile.role.toLowerCase()}
      </p>

      <form className="form" onSubmit={saveProfile} noValidate>
        <label>
          Name
          <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} autoComplete="name" />
          {profileErrors.name && <span className="field-error">{profileErrors.name}</span>}
        </label>
        <label>
          Phone (optional)
          <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} autoComplete="tel" />
          {profileErrors.phone && <span className="field-error">{profileErrors.phone}</span>}
        </label>
        {profileErrors.form && <p className="error">{profileErrors.form}</p>}
        {profileMessage && <p className="success">{profileMessage}</p>}
        <button type="submit" className="primary">
          Save profile
        </button>
      </form>

      <h2>Change password</h2>
      <form className="form" onSubmit={changePassword} noValidate>
        <label>
          Current password
          <input type="password" value={passwords.currentPassword} onChange={pw('currentPassword')} autoComplete="current-password" />
          {passwordErrors.currentPassword && <span className="field-error">{passwordErrors.currentPassword}</span>}
        </label>
        <label>
          New password (at least 8 characters, with a letter and a digit)
          <input type="password" value={passwords.newPassword} onChange={pw('newPassword')} autoComplete="new-password" />
          {passwordErrors.newPassword && <span className="field-error">{passwordErrors.newPassword}</span>}
        </label>
        <label>
          New password again
          <input type="password" value={passwords.confirmPassword} onChange={pw('confirmPassword')} autoComplete="new-password" />
          {passwordErrors.confirmPassword && <span className="field-error">{passwordErrors.confirmPassword}</span>}
        </label>
        {passwordErrors.form && <p className="error">{passwordErrors.form}</p>}
        {passwordMessage && <p className="success">{passwordMessage}</p>}
        <button type="submit" className="primary">
          Change password
        </button>
      </form>
    </section>
  );
}
