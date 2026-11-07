import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { notificationsApi } from '../services/notificationsApi.js';
import { formatDateTime } from '../utils/events.js';
import { notificationLabel } from '../utils/notifications.js';

// In-app notification list; unread ones can be marked as read (EVT-F-034).
export default function NotificationsPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    notificationsApi
      .mine(token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(load, [load]);

  const markRead = async (id) => {
    try {
      await notificationsApi.markRead(id, token);
      load();
      window.dispatchEvent(new Event('notifications-changed'));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h1>Notifications</h1>
      {error && <p className="error">{error}</p>}
      {data && data.items.length === 0 && <p>You have no notifications yet.</p>}
      <div className="card-list">
        {(data ? data.items : []).map((item) => (
          <article key={item.id} className={`card ${item.read ? '' : 'unread'}`}>
            <p>
              <span className="badge badge-note">{notificationLabel(item.type)}</span>{' '}
              {!item.read && <strong>New</strong>}
            </p>
            <p>{item.message}</p>
            <p className="muted">{formatDateTime(item.createdAt)}</p>
            {!item.read && (
              <button type="button" onClick={() => markRead(item.id)}>
                Mark as read
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
