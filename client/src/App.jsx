import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AttendancePage from './pages/AttendancePage';
import ResultsPage from './pages/ResultsPage';
import PaymentPage from './pages/PaymentPage';
import TimetablePage from './pages/TimetablePage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const routes = { student: '/student', faculty: '/faculty', admin: '/admin' };
  return <Navigate to={routes[user.role] || '/login'} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="payments" element={<PaymentPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Faculty Routes */}
            <Route path="/faculty" element={<ProtectedRoute roles={['faculty']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<FacultyDashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="marks" element={<ResultsPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminDashboard />} />
              <Route path="faculty" element={<AdminDashboard />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="payments" element={<PaymentPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="reports" element={<AdminDashboard />} />
              <Route path="settings" element={<ProfilePage />} />
            </Route>

            {/* Profile - shared */}
            <Route path="/profile" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>

        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
          }
        }} />
      </AuthProvider>
    </ThemeProvider>
  );
}
