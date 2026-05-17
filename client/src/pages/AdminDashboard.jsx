import { useState, useEffect } from 'react';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineCreditCard, HiOutlineBell, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: 'student123', phone: '', enrollment_no: '', department: 'Computer Science', semester: 1, year: 2026 });
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', target_role: 'all' });
  const [stats, setStats] = useState({ students: 0, faculty: 0, payments: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [stuRes, payRes, notifRes] = await Promise.all([
        api.get('/students', { params: { limit: 100 } }).catch(() => ({ data: { students: [], pagination: { total: 0 } } })),
        api.get('/payments/history').catch(() => ({ data: { payments: [] } })),
        api.get('/notifications', { params: { limit: 10 } }).catch(() => ({ data: { notifications: [] } })),
      ]);
      const stu = stuRes.data.students || [];
      const pay = payRes.data.payments || [];
      setStudents(stu);
      setPayments(pay);
      setNotifications(notifRes.data.notifications || []);
      const completedPay = pay.filter(p => p.status === 'completed');
      setStats({
        students: stuRes.data.pagination?.total || stu.length,
        faculty: 0,
        payments: completedPay.length,
        revenue: completedPay.reduce((s, p) => s + parseFloat(p.amount || 0), 0),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const createStudent = async () => {
    if (!studentForm.name || !studentForm.email || !studentForm.enrollment_no) return toast.error('Fill required fields');
    try {
      await api.post('/students', studentForm);
      toast.success('Student created!');
      setShowStudentModal(false);
      setStudentForm({ name: '', email: '', password: 'student123', phone: '', enrollment_no: '', department: 'Computer Science', semester: 1, year: 2026 });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const deleteStudent = async (id) => {
    if (!confirm('Delete this student?')) return;
    try { await api.delete(`/students/${id}`); toast.success('Deleted'); fetchData(); }
    catch (e) { toast.error('Failed to delete'); }
  };

  const createNotification = async () => {
    if (!notifForm.title || !notifForm.message) return toast.error('Fill required fields');
    try {
      await api.post('/notifications', notifForm);
      toast.success('Notification sent!');
      setShowNotifModal(false);
      setNotifForm({ title: '', message: '', type: 'info', target_role: 'all' });
      fetchData();
    } catch (e) { toast.error('Failed'); }
  };

  const deptData = {};
  students.forEach(s => { deptData[s.department] = (deptData[s.department] || 0) + 1; });

  const deptChartData = {
    labels: Object.keys(deptData),
    datasets: [{ data: Object.values(deptData), backgroundColor: ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b'], borderWidth: 0 }]
  };

  const payStatusData = {
    labels: ['Completed', 'Pending', 'Failed'],
    datasets: [{
      data: [
        payments.filter(p => p.status === 'completed').length,
        payments.filter(p => p.status === 'pending').length,
        payments.filter(p => p.status === 'failed').length,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0,
    }]
  };

  if (loading) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}</div>;

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Admin Dashboard 🏛️</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage university operations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setShowStudentModal(true)}><HiOutlinePlus /> Add Student</button>
          <button className="btn btn-secondary" onClick={() => setShowNotifModal(true)}><HiOutlineBell /> Send Notice</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatsCard icon={<HiOutlineAcademicCap />} label="Total Students" value={stats.students} color="#4f46e5" delay={1} />
        <StatsCard icon={<HiOutlineUserGroup />} label="Faculty Members" value={stats.faculty || '2'} color="#7c3aed" delay={2} />
        <StatsCard icon={<HiOutlineCreditCard />} label="Payments" value={stats.payments} color="#10b981" delay={3} />
        <StatsCard icon={<HiOutlineCreditCard />} label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="#f59e0b" delay={4} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Students by Department</h3>
          {Object.keys(deptData).length > 0 ? (
            <div style={{ maxWidth: 280, margin: '0 auto' }}>
              <Doughnut data={deptChartData} options={{ plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }, cutout: '65%' }} />
            </div>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No data</p>}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Payment Status</h3>
          {payments.length > 0 ? (
            <div style={{ maxWidth: 280, margin: '0 auto' }}>
              <Doughnut data={payStatusData} options={{ plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }, cutout: '65%' }} />
            </div>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No payments yet</p>}
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Student Directory</h3>
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
            { key: 'enrollment_no', label: 'Enrollment' },
            { key: 'department', label: 'Department' },
            { key: 'semester', label: 'Semester', render: v => `Sem ${v}` },
            { key: 'email', label: 'Email', render: v => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v}</span> },
            { key: 'id', label: 'Actions', sortable: false, render: (v) => (
              <button onClick={() => deleteStudent(v)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}><HiOutlineTrash /></button>
            )}
          ]}
          data={students}
          emptyMessage="No students found"
        />
      </div>

      {/* Recent Notifications */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Notifications</h3>
        {notifications.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No notifications</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'var(--bg-tertiary)' }}>
                <span className={`badge badge-${n.type === 'urgent' ? 'danger' : n.type === 'warning' ? 'warning' : 'info'}`}>{n.type}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.target_role} • {new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={showStudentModal} onClose={() => setShowStudentModal(false)} title="Add New Student" maxWidth={550}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name *</label><input className="input" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} placeholder="Student name" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email *</label><input className="input" type="email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} placeholder="email@university.edu" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone</label><input className="input" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} placeholder="+91-" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Enrollment No *</label><input className="input" value={studentForm.enrollment_no} onChange={e => setStudentForm({...studentForm, enrollment_no: e.target.value})} placeholder="CS-2026-XXX" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Department</label>
            <select className="input" value={studentForm.department} onChange={e => setStudentForm({...studentForm, department: e.target.value})}>
              {['Computer Science','Electronics','Mechanical','Civil','Electrical'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Semester</label><input className="input" type="number" min="1" max="8" value={studentForm.semester} onChange={e => setStudentForm({...studentForm, semester: parseInt(e.target.value)})} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Year</label><input className="input" type="number" value={studentForm.year} onChange={e => setStudentForm({...studentForm, year: parseInt(e.target.value)})} /></div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>Default password: student123</p>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={createStudent}>Create Student</button>
      </Modal>

      {/* Notification Modal */}
      <Modal isOpen={showNotifModal} onClose={() => setShowNotifModal(false)} title="Send Notification" maxWidth={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Title *</label><input className="input" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} placeholder="Notification title" /></div>
          <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message *</label><textarea className="input" rows={4} value={notifForm.message} onChange={e => setNotifForm({...notifForm, message: e.target.value})} placeholder="Write your message..." style={{ resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Type</label>
              <select className="input" value={notifForm.type} onChange={e => setNotifForm({...notifForm, type: e.target.value})}>
                <option value="info">Info</option><option value="warning">Warning</option><option value="urgent">Urgent</option><option value="event">Event</option>
              </select>
            </div>
            <div><label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Target</label>
              <select className="input" value={notifForm.target_role} onChange={e => setNotifForm({...notifForm, target_role: e.target.value})}>
                <option value="all">Everyone</option><option value="student">Students Only</option><option value="faculty">Faculty Only</option>
              </select>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={createNotification}>Send Notification</button>
      </Modal>
    </div>
  );
}
