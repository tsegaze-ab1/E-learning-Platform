import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';

export default function RequireAuth({ children }) {
  const { firebaseUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-5 text-sm text-gray-700">
        Loading...
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
