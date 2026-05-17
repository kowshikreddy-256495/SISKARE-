import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineHome, HiOutlineCalendarDays, HiOutlineClipboardDocumentList,
  HiOutlineCreditCard, HiOutlineBell, HiOutlineUser, HiOutlineClock,
  HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineCog6Tooth,
  HiOutlineChartBarSquare, HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';

const menuItems = {
  student: [
    { path: '/student', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/student/attendance', icon: <HiOutlineCalendarDays />, label: 'Attendance' },
    { path: '/student/results', icon: <HiOutlineClipboardDocumentList />, label: 'Results' },
    { path: '/student/timetable', icon: <HiOutlineClock />, label: 'Timetable' },
    { path: '/student/payments', icon: <HiOutlineCreditCard />, label: 'Payments' },
    { path: '/student/notifications', icon: <HiOutlineBell />, label: 'Notifications' },
    { path: '/profile', icon: <HiOutlineUser />, label: 'Profile' },
  ],
  faculty: [
    { path: '/faculty', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/faculty/attendance', icon: <HiOutlineCalendarDays />, label: 'Mark Attendance' },
    { path: '/faculty/marks', icon: <HiOutlineClipboardDocumentList />, label: 'Enter Marks' },
    { path: '/faculty/timetable', icon: <HiOutlineClock />, label: 'Timetable' },
    { path: '/faculty/notifications', icon: <HiOutlineBell />, label: 'Notifications' },
    { path: '/profile', icon: <HiOutlineUser />, label: 'Profile' },
  ],
  admin: [
    { path: '/admin', icon: <HiOutlineHome />, label: 'Dashboard' },
    { path: '/admin/students', icon: <HiOutlineAcademicCap />, label: 'Students' },
    { path: '/admin/faculty', icon: <HiOutlineUserGroup />, label: 'Faculty' },
    { path: '/admin/timetable', icon: <HiOutlineClock />, label: 'Timetable' },
    { path: '/admin/payments', icon: <HiOutlineCreditCard />, label: 'Payments' },
    { path: '/admin/notifications', icon: <HiOutlineBell />, label: 'Notifications' },
    { path: '/admin/reports', icon: <HiOutlineChartBarSquare />, label: 'Reports' },
    { path: '/admin/settings', icon: <HiOutlineCog6Tooth />, label: 'Settings' },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = menuItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 40, display: 'none',
        }} className="mobile-overlay" />
      )}

      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 'var(--sidebar-width)', zIndex: 50,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.3s ease',
        transform: isOpen ? 'translateX(0)' : undefined,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 20, fontWeight: 900,
          }}>🎓</div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px' }}>UniSIS</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Student Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {items.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path.split('/').length <= 2}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12,
                  fontSize: 14, fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'var(--gradient-primary)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none',
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User info + Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', marginBottom: 8,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--gradient-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 14,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12, width: '100%',
            border: 'none', background: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
          >
            <HiOutlineArrowRightOnRectangle size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          aside { transform: translateX(${isOpen ? '0' : '-100%'}) !important; width: 280px !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </>
  );
}
