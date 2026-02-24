import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../config/firebase.js';
import { getOrCreateUserProfile } from '../services/usersService.js';
import Card, { CardContent, CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const profile = await getOrCreateUserProfile({
        uid: cred.user.uid,
        email: cred.user.email ?? email,
      });

      const role = profile?.role ?? 'student';
      navigate(role === 'admin' ? '/admin' : '/student', { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-zinc-900">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-600">Sign in with email and password.</p>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-100">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="block" htmlFor="login-email">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <div className="mt-1">
                <Input
                  id="login-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="block" htmlFor="login-password">
              <span className="text-sm font-medium text-zinc-700">Password</span>
              <div className="mt-1">
                <Input
                  id="login-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </label>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-5 text-sm text-zinc-600">
            No account?{' '}
            <Link to="/signup" className="font-medium text-zinc-900">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
