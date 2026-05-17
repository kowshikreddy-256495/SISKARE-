import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function TimetablePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const load = async () => {
      try {
        const params = {};
        if (user?.role === 'student' && user?.profile) {
          params.department = user.profile.department;
          params.semester = user.profile.semester;
        } else if (user?.role === 'faculty' && user?.profile) {
          params.department = user.profile.department;
        }
        const res = await api.get('/timetable', { params });
        setTimetable(res.data.timetable || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const todayIndex = new Date().getDay();
  const today = DAYS[todayIndex - 1] || '';

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Timetable</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {user?.profile?.department ? `${user.profile.department} • Semester ${user.profile.semester}` : 'All schedules'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 4 }}>
          {['grid', 'list'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: viewMode === m ? 'var(--bg-secondary)' : 'transparent',
              color: viewMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: viewMode === m ? '0 1px 3px var(--shadow-color)' : 'none',
            }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
          ))}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {DAYS.map((day, di) => {
            const classes = timetable.filter(t => t.day_of_week === day);
            const isToday = day === today;
            return (
              <div key={day} className="card" style={{
                padding: 0, overflow: 'hidden',
                border: isToday ? `2px solid ${DAY_COLORS[di]}` : undefined,
              }}>
                <div style={{
                  padding: '16px 20px',
                  background: `${DAY_COLORS[di]}12`,
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: DAY_COLORS[di] }}>{day}</h3>
                  {isToday && <span className="badge badge-info">Today</span>}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{classes.length} classes</span>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  {classes.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No classes</p>
                  ) : classes.map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 12, padding: '10px 0',
                      borderBottom: i < classes.length - 1 ? '1px solid var(--border-color)' : 'none',
                    }}>
                      <div style={{
                        width: 4, borderRadius: 2, flexShrink: 0,
                        background: c.type === 'lab' ? '#06b6d4' : c.type === 'tutorial' ? '#f59e0b' : DAY_COLORS[di],
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{c.subject}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {c.time_slot} • {c.room || 'TBA'} {c.faculty_name ? `• ${c.faculty_name}` : ''}
                        </p>
                      </div>
                      <span className={`badge badge-${c.type === 'lab' ? 'info' : c.type === 'tutorial' ? 'warning' : 'success'}`}
                        style={{ alignSelf: 'flex-start', fontSize: 11 }}>
                        {c.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 24 }}>
          <table className="data-table">
            <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Room</th><th>Faculty</th><th>Type</th></tr></thead>
            <tbody>
              {timetable.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: t.day_of_week === today ? 700 : 400, color: t.day_of_week === today ? 'var(--brand-primary)' : undefined }}>{t.day_of_week}</td>
                  <td>{t.time_slot}</td>
                  <td style={{ fontWeight: 600 }}>{t.subject}</td>
                  <td>{t.room || 'TBA'}</td>
                  <td>{t.faculty_name || '-'}</td>
                  <td><span className={`badge badge-${t.type === 'lab' ? 'info' : 'success'}`}>{t.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
