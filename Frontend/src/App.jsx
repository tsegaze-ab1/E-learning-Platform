import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Home from './pages/Home.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import CourseDetailsPage from './pages/CourseDetailsPage.jsx';
import AdminContentPage from './pages/AdminContentPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { useAuth } from './auth/AuthProvider.jsx';

export default function App() {
  // No Firebase logic yet — mock user state comes from our mock AuthProvider.
  // To simulate login, you can set `mockAuth.user` + `mockAuth.profile` in localStorage.
  const { firebaseUser, profile, loading } = useAuth();
  const user = firebaseUser ? { ...firebaseUser, role: profile?.role } : null;

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route
          path="/student"
          element={
            <ProtectedRoute user={user} role="student" loading={loading}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId"
          element={
            <ProtectedRoute user={user} role="student" loading={loading}>
              <CourseDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedRoute user={user} role="admin" loading={loading}>
              <AdminContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <HelpPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
