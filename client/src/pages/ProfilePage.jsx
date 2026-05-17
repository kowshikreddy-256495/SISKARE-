import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi2';

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setShowPasswordForm(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const profile = user?.profile || {};
  const info = user?.role === 'student' ? [
    { label: 'Enrollment No', value: profile.enrollment_no },
    { label: 'Department', value: profile.department },
    { label: 'Semester', value: profile.semester },
    { label: 'Year', value: profile.year },
    { label: 'Gender', value: profile.gender },
    { label: 'Address', value: profile.address },
    { label: 'Guardian', value: profile.guardian_name },
  ] : user?.role === 'faculty' ? [
    { label: 'Employee ID', value: profile.employee_id },
    { label: 'Department', value: profile.department },
    { label: 'Designation', value: profile.designation },
    { label: 'Specialization', value: profile.specialization },
  ] : [{ label: 'Role', value: 'System Administrator' }];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: 120, background: 'var(--gradient-primary)', position: 'relative' }}>
          <div style={{
            position: 'absolute', bottom: -40, left: 32,
            width: 88, height: 88, borderRadius: 20, background: 'var(--gradient-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 34, fontWeight: 800,
            border: '4px solid var(--bg-secondary)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        </div>
        <div style={{ padding: '56px 32px 28px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            {user?.phone && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📞 {user.phone}</span>}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HiOutlineUser /> Profile Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {info.filter(i => i.value).map(i => (
            <div key={i.label}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{i.label}</p>
              <p style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>{i.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPasswordForm ? 16 : 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineLockClosed /> Security
          </h3>
          <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => setShowPasswordForm(!showPasswordForm)}>
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>
        {showPasswordForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Current Password</label>
              <input type="password" className="input" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} placeholder="Enter current password" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>New Password</label>
              <input type="password" className="input" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} placeholder="Enter new password" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirm New Password</label>
              <input type="password" className="input" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} placeholder="Confirm new password" />
            </div>
            <button className="btn btn-primary" onClick={changePassword} disabled={saving}>
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
