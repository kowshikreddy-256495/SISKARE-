export default function StatsCard({ icon, label, value, trend, color = '#4f46e5', delay = 0 }) {
  const gradients = {
    '#4f46e5': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    '#10b981': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    '#f59e0b': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    '#06b6d4': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    '#ef4444': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  };

  return (
    <div className={`card animate-fadeIn delay-${delay}`} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: gradients[color] || gradients['#4f46e5'],
        opacity: 0.1,
      }} />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{label}</p>
          <h3 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>{value}</h3>
          {trend && (
            <p style={{ fontSize: 12, marginTop: 8, color: trend.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {trend}
            </p>
          )}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: gradients[color] || gradients['#4f46e5'],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 22,
          boxShadow: `0 4px 14px ${color}40`,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
