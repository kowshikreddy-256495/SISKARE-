import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      const routes = { student: '/student', faculty: '/faculty', admin: '/admin' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: darkMode
        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 30%, #c7d2fe 60%, #ddd6fe 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
        top: '-10%', right: '-5%', animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        bottom: '-10%', left: '-5%', animation: 'float 10s ease-in-out infinite reverse',
      }} />

      {/* Left panel - Branding */}
      <div className="login-brand" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px',
        position: 'relative',
      }}>
        <div className="animate-slideLeft">
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, marginBottom: 32,
            boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)',
          }}>🎓</div>
          <h1 style={{
            fontSize: 48, fontWeight: 900, lineHeight: 1.1,
            letterSpacing: '-1.5px', marginBottom: 16,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            University<br />Student Portal
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.7 }}>
            Access your academic records, attendance, timetable, and make payments — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
            {[
              { num: '5000+', label: 'Students' },
              { num: '200+', label: 'Faculty' },
              { num: '50+', label: 'Courses' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-primary)' }}>{s.num}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div className="animate-fadeIn" style={{
          width: '100%', maxWidth: 440, padding: '48px 40px',
          borderRadius: 24, position: 'relative',
          background: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
          boxShadow: darkMode
            ? '0 25px 60px rgba(0,0,0,0.5)'
            : '0 25px 60px rgba(79, 70, 229, 0.12)',
        }}>
          {/* Dark mode toggle */}
          <button onClick={toggleDarkMode} style={{
            position: 'absolute', top: 20, right: 20,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            borderRadius: 10, width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-primary)', fontSize: 16,
          }}>
            {darkMode ? '☀️' : '🌙'}
          </button>

          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input
                  type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input
                  type={showPassword ? 'text' : 'password'} className="input" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18,
                }}>
                  {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 14 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: 28, padding: 16, borderRadius: 12,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>DEMO CREDENTIALS</p>
            {[
              { role: 'Admin', email: 'admin@university.edu' },
              { role: 'Faculty', email: 'rajesh.kumar@university.edu' },
              { role: 'Student', email: 'aarav.patel@university.edu' },
            ].map(cred => (
              <button key={cred.role} onClick={() => { setEmail(cred.email); setPassword('password'); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 12px', marginBottom: 4,
                  background: 'none', border: 'none', borderRadius: 8,
                  cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontWeight: 600 }}>{cred.role}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{cred.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        @media (max-width: 768px) {
          .login-brand { display: none !important; }
        }
      `}</style>
    </div>
  );
}
