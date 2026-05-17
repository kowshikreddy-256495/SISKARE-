import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import { HiOutlineCalendarDays, HiOutlineClipboardDocumentList, HiOutlineCreditCard, HiOutlineBell, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi2';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({ summary: {} });
  const [marks, setMarks] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const studentId = user?.profile?.id;
        if (!studentId) return;
        const [attRes, marksRes, ttRes, notifRes] = await Promise.all([
          api.get(`/attendance/student/${studentId}`).catch(() => ({ data: { summary: {} } })),
          api.get(`/marks/student/${studentId}`).catch(() => ({ data: { summary: [] } })),
          api.get('/timetable', { params: { department: user.profile.department, semester: user.profile.semester } }).catch(() => ({ data: { timetable: [] } })),
          api.get('/notifications', { params: { limit: 5 } }).catch(() => ({ data: { notifications: [] } })),
        ]);
        setAttendance(attRes.data);
        setMarks(marksRes.data.summary || []);
        setTimetable(ttRes.data.timetable || []);
        setNotifications(notifRes.data.notifications || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const totalAttendance = Object.values(attendance.summary || {});
  const overallAtt = totalAttendance.length > 0
    ? Math.round(totalAttendance.reduce((s, a) => s + a.percentage, 0) / totalAttendance.length)
    : 0;
  const overallMarks = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length)
    : 0;

  const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const todayClasses = timetable.filter(t => t.day_of_week === today);

  const attChartData = {
    labels: totalAttendance.map((_, i) => Object.keys(attendance.summary || {})[i]),
    datasets: [{
      data: totalAttendance.map(a => a.percentage),
      backgroundColor: ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }]
  };

  const marksChartData = {
    labels: marks.map(m => m.subject.length > 12 ? m.subject.slice(0, 12) + '…' : m.subject),
    datasets: [{
      label: 'Score %',
      data: marks.map(m => m.percentage),
      backgroundColor: 'rgba(79, 70, 229, 0.7)',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          {user?.profile?.department} • Semester {user?.profile?.semester} • {user?.profile?.enrollment_no}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatsCard icon={<HiOutlineCalendarDays />} label="Overall Attendance" value={`${overallAtt}%`} color="#4f46e5" delay={1} />
        <StatsCard icon={<HiOutlineClipboardDocumentList />} label="Average Score" value={`${overallMarks}%`} color="#10b981" delay={2} />
        <StatsCard icon={<HiOutlineClock />} label="Today's Classes" value={todayClasses.length} color="#06b6d4" delay={3} />
        <StatsCard icon={<HiOutlineBell />} label="Notifications" value={notifications.length} color="#f59e0b" delay={4} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Attendance Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Attendance by Subject</h3>
          {totalAttendance.length > 0 ? (
            <div style={{ maxWidth: 280, margin: '0 auto' }}>
              <Doughnut data={attChartData} options={{ plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }, cutout: '65%' }} />
            </div>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No attendance data</p>}
        </div>

        {/* Marks Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Subject-wise Scores</h3>
          {marks.length > 0 ? (
            <Bar data={marksChartData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, max: 100, grid: { color: 'var(--border-color)' } }, x: { grid: { display: false } } },
            }} />
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No marks data</p>}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
        {/* Today's Schedule */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Today's Schedule — {today}</h3>
          {todayClasses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>🎉 No classes today!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayClasses.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: c.type === 'lab' ? 'var(--gradient-secondary)' : 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 18, flexShrink: 0,
                  }}>
                    {c.type === 'lab' ? '🔬' : '📚'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{c.subject}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {c.time_slot} • {c.room} {c.faculty_name ? `• ${c.faculty_name}` : ''}
                    </p>
                  </div>
                  <span className={`badge badge-${c.type === 'lab' ? 'info' : 'success'}`}>
                    {c.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>No notifications</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`badge badge-${n.type === 'urgent' ? 'danger' : n.type === 'warning' ? 'warning' : 'info'}`}>
                      {n.type}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{n.message.slice(0, 100)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
