import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineBell, HiOutlineMegaphone, HiOutlineExclamationTriangle, HiOutlineCalendar } from 'react-icons/hi2';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/notifications', { params: { limit: 50 } });
        setNotifications(res.data.notifications || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const typeConfig = {
    info: { icon: <HiOutlineBell />, color: '#06b6d4', bg: '#06b6d418' },
    warning: { icon: <HiOutlineExclamationTriangle />, color: '#f59e0b', bg: '#f59e0b18' },
    urgent: { icon: <HiOutlineMegaphone />, color: '#ef4444', bg: '#ef444418' },
    event: { icon: <HiOutlineCalendar />, color: '#7c3aed', bg: '#7c3aed18' },
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Notifications</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Stay updated with university announcements</p>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>🔔</p>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((n, i) => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            return (
              <div key={n.id} className="card animate-fadeIn" style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div style={{ display: 'flex', gap: 16, padding: '20px 24px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: cfg.bg, color: cfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>{cfg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{n.title}</h3>
                      <span className={`badge badge-${n.type === 'urgent' ? 'danger' : n.type === 'warning' ? 'warning' : 'info'}`}>{n.type}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{n.message}</p>
                    {n.created_by_name && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>— {n.created_by_name}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
