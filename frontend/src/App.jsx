import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import RequireRole from './components/RequireRole.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import MyEventsPage from './pages/MyEventsPage.jsx';
import MyRegistrationsPage from './pages/MyRegistrationsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import CheckInPage from './pages/CheckInPage.jsx';
import TicketPage from './pages/TicketPage.jsx';
import EventRegistrationsPage from './pages/EventRegistrationsPage.jsx';
import EditEventPage from './pages/EditEventPage.jsx';
import AdminCategoriesPage from './pages/AdminCategoriesPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import EventReportPage from './pages/EventReportPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route
          path="/attendee"
          element={
            <RequireRole roles={['ATTENDEE']}>
              <MyRegistrationsPage />
            </RequireRole>
          }
        />
        <Route
          path="/organizer"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <MyEventsPage />
            </RequireRole>
          }
        />
        <Route
          path="/organizer/new"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <CreateEventPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole roles={['ADMIN']}>
              <AdminDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireRole roles={['ATTENDEE', 'ORGANIZER', 'ADMIN']}>
              <NotificationsPage />
            </RequireRole>
          }
        />
        <Route
          path="/organizer/events/:id/checkin"
          element={
            <RequireRole roles={['ORGANIZER', 'ADMIN']}>
              <CheckInPage />
            </RequireRole>
          }
        />
        <Route
          path="/attendee/tickets/:id"
          element={
            <RequireRole roles={['ATTENDEE']}>
              <TicketPage />
            </RequireRole>
          }
        />
        <Route
          path="/organizer/events/:id/registrations"
          element={
            <RequireRole roles={['ORGANIZER', 'ADMIN']}>
              <EventRegistrationsPage />
            </RequireRole>
          }
        />
        <Route
          path="/organizer/events/:id/edit"
          element={
            <RequireRole roles={['ORGANIZER', 'ADMIN']}>
              <EditEventPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireRole roles={['ADMIN']}>
              <AdminCategoriesPage />
            </RequireRole>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireRole roles={['ATTENDEE', 'ORGANIZER', 'ADMIN']}>
              <ProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole roles={['ADMIN']}>
              <AdminUsersPage />
            </RequireRole>
          }
        />
        <Route
          path="/organizer/events/:id/report"
          element={
            <RequireRole roles={['ORGANIZER', 'ADMIN']}>
              <EventReportPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
