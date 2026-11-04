import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

// Shows a page only to the given roles (EVT-F-005). Visitors are sent to the login page.
export default function RequireRole({ roles, children }) {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!roles.includes(role)) {
    return (
      <section>
        <h1>Access denied</h1>
        <p>Your account does not have permission to open this page.</p>
      </section>
    );
  }
  return children;
}
