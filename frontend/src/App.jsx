import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RolePage from './pages/RolePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/attendee" element={<RolePage title="Attendee area" />} />
        <Route path="/organizer" element={<RolePage title="Organizer area" />} />
        <Route path="/admin" element={<RolePage title="Admin area" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
