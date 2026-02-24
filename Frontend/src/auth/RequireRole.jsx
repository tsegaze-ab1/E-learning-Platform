import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';
import Card, { CardContent } from '../components/ui/Card.jsx';

export default function RequireRole({ role, children }) {
  const { firebaseUser, profile, loading } = useAuth();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-zinc-700">Loading…</CardContent>
      </Card>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = profile?.role;

  if (!currentRole) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-zinc-700">
          Profile is missing. Try logging out and in again.
        </CardContent>
      </Card>
    );
  }

  if (currentRole !== role) {
    return <Navigate to={currentRole === 'admin' ? '/admin/content' : '/student'} replace />;
  }

  return children;
}
