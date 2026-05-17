import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';

export default function ResultsPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const studentId = user?.profile?.id;
        if (!studentId) return;
        const res = await api.get(`/marks/student/${studentId}`);
        setMarks(res.data.marks || []);
        setSummary(res.data.summary || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/marks/result-pdf/${user?.profile?.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `result_${user?.profile?.enrollment_no}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Result downloaded!');
    } catch (e) { toast.error('Failed to download PDF'); }
    finally { setDownloading(false); }
  };

  const gradeColor = (grade) => {
    if (['O', 'A+'].includes(grade)) return '#10b981';
    if (['A', 'B+'].includes(grade)) return '#06b6d4';
    if (['B', 'C'].includes(grade)) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  const overallPct = summary.length > 0 ? Math.round(summary.reduce((s, m) => s + m.percentage, 0) / summary.length) : 0;
  const overallGrade = overallPct >= 90 ? 'O' : overallPct >= 80 ? 'A+' : overallPct >= 70 ? 'A' : overallPct >= 60 ? 'B+' : overallPct >= 50 ? 'B' : overallPct >= 40 ? 'C' : 'F';

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Examination Results</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Semester {user?.profile?.semester} • {user?.profile?.department}</p>
        </div>
        <button className="btn btn-primary" onClick={downloadPDF} disabled={downloading || marks.length === 0}>
          <HiOutlineArrowDownTray /> {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      {/* Overall Stats */}
      {summary.length > 0 && (
        <div className="card" style={{ padding: 28, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `conic-gradient(${gradeColor(overallGrade)} ${overallPct * 3.6}deg, var(--bg-tertiary) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: gradeColor(overallGrade) }}>{overallPct}%</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Overall Performance</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: gradeColor(overallGrade), letterSpacing: '-1px' }}>Grade {overallGrade}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{summary.length} subjects • {marks.length} exams</p>
          </div>
        </div>
      )}

      {/* Subject Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
        {summary.map((s, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subject}</h4>
              <span style={{
                fontSize: 20, fontWeight: 900, padding: '4px 14px', borderRadius: 10,
                background: `${gradeColor(s.grade)}18`, color: gradeColor(s.grade),
              }}>{s.grade}</span>
            </div>
            <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ width: `${s.percentage}%`, height: '100%', borderRadius: 4, background: gradeColor(s.grade), transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
              <span>{s.totalObtained} / {s.totalMax}</span>
              <span style={{ fontWeight: 700, color: gradeColor(s.grade) }}>{s.percentage}%</span>
            </div>
            {/* Individual exams */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
              {s.exams.map((e, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: 'var(--text-secondary)' }}>
                  <span style={{ textTransform: 'capitalize' }}>{e.exam_type}</span>
                  <span style={{ fontWeight: 600 }}>{e.marks_obtained} / {e.total_marks}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {marks.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><p style={{ fontSize: 48 }}>📋</p><p>No results available yet</p></div>}
    </div>
  );
}
