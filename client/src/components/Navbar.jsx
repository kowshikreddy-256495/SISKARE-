import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineSun, HiOutlineMoon, HiOutlineBell, HiOutlineBars3 } from 'react-icons/hi2';

export default function Navbar({ onMenuClick }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  return (
    <header style={{
      height: 'var(--navbar-height)',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onMenuClick} className="mobile-menu-btn" style={{
          display: 'none', background: 'none', border: 'none',
          color: 'var(--text-primary)', cursor: 'pointer', fontSize: 24, padding: 4,
        }}>
          <HiOutlineBars3 />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
            {user?.role === 'student' ? 'Student Portal' : user?.role === 'faculty' ? 'Faculty Portal' : 'Admin Panel'}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={toggleDarkMode} style={{
          width: 42, height: 42, borderRadius: 12,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, transition: 'all 0.2s',
        }} title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>

        <button style={{
          width: 42, height: 42, borderRadius: 12,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, position: 'relative',
        }}>
          <HiOutlineBell />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: '#ef4444',
          }} />
        </button>

        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 15,
          marginLeft: 4,
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
