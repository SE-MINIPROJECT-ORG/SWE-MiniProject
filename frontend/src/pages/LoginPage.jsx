import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const DEMO_ROLES = [
  { role: 'ATTENDEE', path: '/attendee', label: 'Continue as Attendee' },
  { role: 'ORGANIZER', path: '/organizer', label: 'Continue as Organizer' },
  { role: 'ADMIN', path: '/admin', label: 'Continue as Admin' },
];

// Demo-only login so the role-based navigation can be shown.
// It is replaced by the real email and password login (EVT-F-002).
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const choose = (item) => {
    login({ name: item.role.toLowerCase(), role: item.role });
    navigate(item.path);
  };

  return (
    <section>
      <h1>Login</h1>
      <p>Demo only: choose a role to see its navigation.</p>
      <div className="button-row">
        {DEMO_ROLES.map((item) => (
          <button key={item.role} type="button" onClick={() => choose(item)}>
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
