export default function LoadingSpinner({ fullScreen = false, size = 40 }) {
  const spinner = (
    <div style={{
      width: size, height: size,
      border: '3px solid var(--border-color)',
      borderTopColor: 'var(--brand-primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );

  if (fullScreen) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', width: '100vw', background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          {spinner}
          <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      {spinner}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
