import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        transition: 'margin 0.3s ease',
        display: 'flex', flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main style={{ flex: 1, padding: 24, maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="marginLeft"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
