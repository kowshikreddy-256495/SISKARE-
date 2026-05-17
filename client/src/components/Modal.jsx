import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 500 }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn 0.2s ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{
        width: '100%', maxWidth, maxHeight: '85vh', overflow: 'auto',
        animation: 'fadeIn 0.3s ease-out',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22,
            color: 'var(--text-muted)', cursor: 'pointer', padding: 4,
          }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
