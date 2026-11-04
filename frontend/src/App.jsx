import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import RequireRole from './components/RequireRole.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RolePage from './pages/RolePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/attendee"
          element={
            <RequireRole roles={['ATTENDEE']}>
              <RolePage title="My registrations" />
            </RequireRole>
          }
        />
        <Route
          path="/organizer"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <RolePage title="My events" />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole roles={['ADMIN']}>
              <RolePage title="Admin console" />
            </RequireRole>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
