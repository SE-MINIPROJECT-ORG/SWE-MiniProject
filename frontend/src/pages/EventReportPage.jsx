import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { reportsApi } from '../services/reportsApi.js';
import { formatDateTime } from '../utils/events.js';
import { percentText } from '../utils/reports.js';

// Organizer's report for one event (EVT-F-035) with the attendee CSV download (EVT-F-036).
export default function EventReportPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi
      .report(id, token)
      .then(setReport)
      .catch((err) => setError(err.message));
  }, [id, token]);

  const download = async () => {
    setError('');
    try {
      await reportsApi.downloadCsv(id, token);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !report) return <p className="error">{error}</p>;
  if (!report) return <p>Loading...</p>;

  const tiles = [
    ['Confirmed', report.confirmed],
    ['Checked in', report.checkedIn],
    ['Waitlisted', report.waitlisted],
    ['Cancelled', report.cancelled],
  ];

  return (
    <section>
      <p>
        <Link to="/organizer">Back to my events</Link>
      </p>
      <h1>Report: {report.event.title}</h1>
      <p className="muted">
        {formatDateTime(report.event.startTime)} · capacity {report.event.capacity} · {report.event.status.toLowerCase()}
      </p>
      <div className="stat-grid">
        {tiles.map(([label, value]) => (
          <div key={label} className="stat">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
        <div className="stat highlight">
          <span className="stat-value">{percentText(report.attendanceRate)}</span>
          <span className="stat-label">Attendance rate (checked in ÷ confirmed)</span>
        </div>
      </div>
      <button type="button" className="primary" onClick={download}>
        Download attendee list (CSV)
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
