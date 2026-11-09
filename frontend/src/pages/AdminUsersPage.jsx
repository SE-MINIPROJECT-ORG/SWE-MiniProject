import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { usersApi } from '../services/usersApi.js';

const ROLES = ['ATTENDEE', 'ORGANIZER', 'ADMIN'];

// Admin views all users, changes roles, and deactivates or reactivates accounts (EVT-F-006).
// A role change applies from the user's next login.
export default function AdminUsersPage() {
  const { token, user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    usersApi
      .list(token)
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(load, [load]);

  const run = async (action, success) => {
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(success);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const changeRole = (user, role) =>
    run(() => usersApi.changeRole(user.id, role, token), `${user.name} is now ${role.toLowerCase()} (from their next login)`);

  const toggleActive = (user) => {
    const verb = user.active ? 'Deactivate' : 'Reactivate';
    if (!window.confirm(`${verb} ${user.name}?`)) return;
    run(() => usersApi.changeStatus(user.id, !user.active, token), `${user.name} ${user.active ? 'deactivated' : 'reactivated'}`);
  };

  return (
    <section>
      <h1>Users</h1>
      {message && <p className="success">{message}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const self = user.id === me.id;
              return (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      disabled={self}
                      onChange={(e) => changeRole(user, e.target.value)}
                      aria-label={`Role of ${user.name}`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${user.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {user.active ? 'Active' : 'Deactivated'}
                    </span>
                    {user.locked && <span className="badge badge-waitlisted"> Locked</span>}
                  </td>
                  <td>
                    {self ? (
                      <span className="muted">You</span>
                    ) : (
                      <button type="button" className={user.active ? 'danger' : 'primary'} onClick={() => toggleActive(user)}>
                        {user.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
