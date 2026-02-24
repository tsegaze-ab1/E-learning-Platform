import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { cn } from '../lib/cn.js';
import { auth } from '../config/firebase.js';
import { getOrCreateUserProfile } from '../services/usersService.js';

function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconLock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11h12v10H6z" />
    </svg>
  );
}

function Spinner({ className }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
      />
    </svg>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  Icon,
  error,
  disabled,
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
          <Icon className="h-4 w-4" />
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'w-full rounded-[var(--ds-radius-md)] border bg-slate-900 pl-10 pr-3 text-sm text-slate-100',
            'h-10 border transition duration-200',
            error
              ? 'border-red-400/50 focus:border-red-400 focus:ring-4 focus:ring-red-500/20'
              : 'border-slate-700 focus:border-amber-400/60 focus:ring-4 focus:ring-amber-500/15',
            'placeholder:text-slate-500 focus:outline-none',
            disabled ? 'bg-slate-800 text-slate-500' : null,
          )}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const errors = useMemo(() => {
    const next = { email: '', password: '' };
    if (!email) next.email = 'Email is required.';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address.';

    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    return next;
  }, [email, password]);

  const canSubmit =
    !submitting &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    !errors.email &&
    !errors.password;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await getOrCreateUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
      });

      const intendedPath = location.state?.from?.pathname ?? null;
      const fallbackPath = '/student';
      navigate(intendedPath || fallbackPath, { replace: true });
    } catch (err) {
      const code = err?.code ?? '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setSubmitError('Invalid email or password.');
      } else if (code === 'auth/too-many-requests') {
        setSubmitError('Too many attempts. Please wait a bit and try again.');
      } else {
        setSubmitError(err?.message ?? 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-md place-items-center text-slate-100">
      <div
        className={cn(
          'w-full rounded-2xl border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-black/35 backdrop-blur sm:p-8',
          'transition-all duration-300',
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30">
                E
              </span>
              <span className="text-sm font-semibold tracking-tight text-white">C++ Learning</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Sign in</h1>
            <p className="mt-1 text-sm text-slate-300">
              Continue your learning journey with a premium dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {submitError ? (
            <div className="rounded-lg border border-red-400/35 bg-red-500/10 p-3 text-xs text-red-200">
              {submitError}
            </div>
          ) : null}

          <Field
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            Icon={IconMail}
            error={touched.email ? errors.email : ''}
            disabled={submitting}
          />

          <Field
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            Icon={IconLock}
            error={touched.password ? errors.password : ''}
            disabled={submitting}
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition duration-200 hover:-translate-y-0.5 disabled:opacity-60',
            )}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-400">New here?</span>
            <Link to="/signup" className="font-medium text-amber-200 no-underline hover:text-amber-100">
              Create an account
            </Link>
          </div>
        </form>

        <div className="mt-6 rounded-[var(--ds-radius-md)] border border-slate-700 bg-slate-950 p-3 text-xs text-slate-400">
          Sign in with your registered account.
        </div>
      </div>
    </div>
  );
}
