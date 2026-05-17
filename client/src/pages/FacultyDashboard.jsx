import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineCalendarDays, HiOutlineClipboardDocumentList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [showAttModal, setShowAttModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [attForm, setAttForm] = useState({ subject: '', date: new Date().toISOString().split('T')[0], records: [] });
  const [marksForm, setMarksForm] = useState({ subject: '', exam_type: 'midterm', total_marks: 50, semester: 4, records: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stuRes, ttRes] = await Promise.all([
          api.get('/students', { params: { department: user?.profile?.department, limit: 100 } }).catch(() => ({ data: { students: [] } })),
          api.get('/timetable', { params: { department: user?.profile?.department } }).catch(() => ({ data: { timetable: [] } })),
        ]);
        setStudents(stuRes.data.students || []);
        setTimetable(ttRes.data.timetable || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const todayClasses = timetable.filter(t => t.day_of_week === today);
  const subjects = [...new Set(timetable.map(t => t.subject))];

  const openAttModal = (subject) => {
    setAttForm({
      subject, date: new Date().toISOString().split('T')[0],
      records: students.map(s => ({ student_id: s.id, name: s.name, enrollment_no: s.enrollment_no, status: 'present' }))
    });
    setShowAttModal(true);
  };

  const openMarksModal = (subject) => {
    setMarksForm({
      subject, exam_type: 'midterm', total_marks: 50, semester: 4, academic_year: '2025-26',
      records: students.map(s => ({ student_id: s.id, name: s.name, enrollment_no: s.enrollment_no, marks_obtained: '' }))
    });
    setShowMarksModal(true);
  };

  const submitAttendance = async () => {
    try {
      await api.post('/attendance', {
        subject: attForm.subject, date: attForm.date,
        records: attForm.records.map(r => ({ student_id: r.student_id, status: r.status }))
      });
      toast.success('Attendance marked!');
      setShowAttModal(false);
    } catch (e) { toast.error('Failed to mark attendance'); }
  };

  const submitMarks = async () => {
    const valid = marksForm.records.filter(r => r.marks_obtained !== '');
    if (valid.length === 0) return toast.error('Enter at least one mark');
    try {
      await api.post('/marks', {
        subject: marksForm.subject, exam_type: marksForm.exam_type,
        total_marks: marksForm.total_marks, semester: marksForm.semester,
        academic_year: marksForm.academic_year,
        records: valid.map(r => ({ student_id: r.student_id, marks_obtained: parseFloat(r.marks_obtained) }))
      });
      toast.success('Marks entered!');
      setShowMarksModal(false);
    } catch (e) { toast.error('Failed to enter marks'); }
  };

  if (loading) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}</div>;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Welcome, {user?.name?.split(' ')[0]}! 👨‍🏫</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>{user?.profile?.department} • {user?.profile?.designation}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatsCard icon={<HiOutlineUserGroup />} label="Total Students" value={students.length} color="#4f46e5" delay={1} />
        <StatsCard icon={<HiOutlineClock />} label="Today's Classes" value={todayClasses.length} color="#06b6d4" delay={2} />
        <StatsCard icon={<HiOutlineCalendarDays />} label="Subjects" value={subjects.length} color="#10b981" delay={3} />
        <StatsCard icon={<HiOutlineClipboardDocumentList />} label="Department" value={user?.profile?.department?.slice(0, 8)} color="#f59e0b" delay={4} />
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {subjects.map(s => (
            <div key={s} style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => openAttModal(s)}>
                <HiOutlineCalendarDays /> Attendance: {s.length > 15 ? s.slice(0, 15) + '…' : s}
              </button>
              <button className="btn btn-success" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => openMarksModal(s)}>
                <HiOutlineClipboardDocumentList /> Marks: {s.length > 15 ? s.slice(0, 15) + '…' : s}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Today's Schedule — {today}</h3>
        {todayClasses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>🎉 No classes today!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {todayClasses.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: c.type === 'lab' ? 'var(--gradient-secondary)' : 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>{c.type === 'lab' ? '🔬' : '📚'}</div>
                <div><p style={{ fontWeight: 600, fontSize: 14 }}>{c.subject}</p><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.time_slot} • {c.room}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Students ({students.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Enrollment</th><th>Semester</th><th>Email</th></tr></thead>
            <tbody>
              {students.slice(0, 20).map(s => (
                <tr key={s.id}><td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.enrollment_no}</td><td>Sem {s.semester}</td><td style={{ color: 'var(--text-muted)' }}>{s.email}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Modal */}
      <Modal isOpen={showAttModal} onClose={() => setShowAttModal(false)} title={`Mark Attendance — ${attForm.subject}`} maxWidth={600}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Date</label>
          <input type="date" className="input" value={attForm.date} onChange={e => setAttForm({...attForm, date: e.target.value})} />
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {attForm.records.map((r, i) => (
            <div key={r.student_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div><p style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</p><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.enrollment_no}</p></div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['present', 'absent', 'late'].map(s => (
                  <button key={s} onClick={() => {
                    const rec = [...attForm.records]; rec[i].status = s; setAttForm({...attForm, records: rec});
                  }} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: r.status === s ? (s === 'present' ? '#10b981' : s === 'absent' ? '#ef4444' : '#f59e0b') : 'var(--bg-tertiary)',
                    color: r.status === s ? 'white' : 'var(--text-secondary)',
                  }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={submitAttendance}>Submit Attendance</button>
      </Modal>

      {/* Marks Modal */}
      <Modal isOpen={showMarksModal} onClose={() => setShowMarksModal(false)} title={`Enter Marks — ${marksForm.subject}`} maxWidth={600}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Exam Type</label>
            <select className="input" value={marksForm.exam_type} onChange={e => setMarksForm({...marksForm, exam_type: e.target.value})}>
              <option value="midterm">Midterm</option><option value="final">Final</option><option value="assignment">Assignment</option><option value="quiz">Quiz</option><option value="practical">Practical</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Total Marks</label>
            <input type="number" className="input" value={marksForm.total_marks} onChange={e => setMarksForm({...marksForm, total_marks: parseInt(e.target.value)})} />
          </div>
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {marksForm.records.map((r, i) => (
            <div key={r.student_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div><p style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</p><p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.enrollment_no}</p></div>
              <input type="number" className="input" style={{ width: 100 }} placeholder={`/ ${marksForm.total_marks}`} value={r.marks_obtained}
                onChange={e => { const rec = [...marksForm.records]; rec[i].marks_obtained = e.target.value; setMarksForm({...marksForm, records: rec}); }} />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={submitMarks}>Submit Marks</button>
      </Modal>
    </div>
  );
}
