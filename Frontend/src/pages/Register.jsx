import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../config/firebase.js';
import { createUserProfileIfMissing } from '../services/usersService.js';
import Card, { CardContent, CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Register() {
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
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await createUserProfileIfMissing({
        uid: cred.user.uid,
        email: cred.user.email ?? email,
      });

      navigate('/student', { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-zinc-900">Create your account</h1>
          <p className="mt-1 text-sm text-zinc-600">Email/password registration.</p>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-100">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="block" htmlFor="register-email">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <div className="mt-1">
                <Input
                  id="register-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="block" htmlFor="register-password">
              <span className="text-sm font-medium text-zinc-700">Password</span>
              <div className="mt-1">
                <Input
                  id="register-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </label>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating…' : 'Sign up'}
            </Button>
          </form>

          <p className="mt-5 text-sm text-zinc-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-zinc-900">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
