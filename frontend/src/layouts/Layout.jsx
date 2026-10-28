import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { getNavLinks } from '../utils/navLinks.js';

export default function Layout() {
  const { role, user, logout } = useAuth();
  const links = getNavLinks(role);

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
            <button type="button" className="link-button" onClick={logout}>
              Logout
            </button>
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
