import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { getNavLinks } from '../utils/navLinks.js';
import { notificationsApi } from '../services/notificationsApi.js';
import { unreadText } from '../utils/notifications.js';

export default function Layout() {
  const { role, user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = getNavLinks(role);
  const [unread, setUnread] = useState(0);

  // Refresh the unread count on every page change and when a notification is marked read.
  useEffect(() => {
    if (!token) {
      setUnread(0);
      return undefined;
    }
    const refresh = () =>
      notificationsApi
        .mine(token)
        .then((data) => setUnread(data.unread))
        .catch(() => setUnread(0));
    refresh();
    window.addEventListener('notifications-changed', refresh);
    return () => window.removeEventListener('notifications-changed', refresh);
  }, [token, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="app">
      <header className="header">
        <span className="brand">Event Management System</span>
        <nav className="nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink to="/notifications">{unreadText(unread)}</NavLink>
              <NavLink to="/profile" className="user-name" title="My profile">
                {user.name}
              </NavLink>
              <button type="button" className="link-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">UE24CS341A Software Engineering Mini Project</footer>
    </div>
  );
}
