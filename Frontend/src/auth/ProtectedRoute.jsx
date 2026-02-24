import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ user, role, loading = false, children }) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentRole = user?.role;

  if (role && currentRole && currentRole !== role) {
    return <Navigate to={currentRole === 'admin' ? '/admin/content' : '/student'} replace />;
  }

  if (role && !currentRole) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
        Loading profile...
      </div>
    );
  }

  return children;
}
