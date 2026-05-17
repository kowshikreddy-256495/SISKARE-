import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi2';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const studentId = user?.profile?.id;
        if (!studentId) return;
        const res = await api.get(`/attendance/student/${studentId}`);
        setAttendance(res.data.attendance || []);
        setSummary(res.data.summary || {});
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const subjects = Object.keys(summary);
  const filtered = selectedSubject === 'all' ? attendance : attendance.filter(a => a.subject === selectedSubject);

  const statusIcon = (s) => {
    if (s === 'present') return <HiOutlineCheckCircle style={{ color: '#10b981', fontSize: 20 }} />;
    if (s === 'absent') return <HiOutlineXCircle style={{ color: '#ef4444', fontSize: 20 }} />;
    return <HiOutlineClock style={{ color: '#f59e0b', fontSize: 20 }} />;
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Attendance Record</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Track your attendance across all subjects</p>

      {/* Subject Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {subjects.map(sub => {
          const s = summary[sub];
          const pct = s.percentage;
          const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
          return (
            <div key={sub} className="card" style={{ padding: 20, cursor: 'pointer', border: selectedSubject === sub ? `2px solid ${color}` : undefined }}
              onClick={() => setSelectedSubject(selectedSubject === sub ? 'all' : sub)}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color }}>{pct}%</span>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>P: {s.present}</span><span>A: {s.absent}</span><span>L: {s.late}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Records */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            {selectedSubject === 'all' ? 'All Records' : selectedSubject} ({filtered.length})
          </h3>
          {selectedSubject !== 'all' && (
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setSelectedSubject('all')}>Show All</button>
          )}
        </div>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>{new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td style={{ fontWeight: 600 }}>{a.subject}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {statusIcon(a.status)}
                        <span className={`badge badge-${a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : 'warning'}`}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
