import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { cn } from '../lib/cn.js';
import { auth } from '../config/firebase.js';
import { getOrCreateUserProfile } from '../services/usersService.js';

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 0 0-16 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    </svg>
  );
}

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
    <svg className={cn('h-4 w-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" />
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

export default function SignupPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const errors = useMemo(() => {
    const next = { name: '', email: '', password: '', confirmPassword: '' };
    if (!name.trim()) next.name = 'Name is required.';

    if (!email) next.email = 'Email is required.';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address.';

    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters.';

    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';

    return next;
  }, [name, email, password, confirmPassword]);

  const canSubmit =
    !submitting &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!canSubmit) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }

      await getOrCreateUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
      });

      navigate('/student', { replace: true });
    } catch (err) {
      const code = err?.code ?? '';
      if (code === 'auth/email-already-in-use') {
        setSubmitError('That email is already in use. Try logging in instead.');
      } else if (code === 'auth/weak-password') {
        setSubmitError('Password is too weak. Use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setSubmitError('Please provide a valid email address.');
      } else {
        setSubmitError(err?.message ?? 'Signup failed. Please try again.');
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
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30">
            C++
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">C++ Learning</span>
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-300">Start learning with a premium EdTech experience.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {submitError ? (
            <div className="rounded-lg border border-red-400/35 bg-red-500/10 p-3 text-xs text-red-200">
              {submitError}
            </div>
          ) : null}

          <Field
            id="signup-name"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            Icon={IconUser}
            error={touched.name ? errors.name : ''}
            disabled={submitting}
          />

          <Field
            id="signup-email"
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
            id="signup-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            Icon={IconLock}
            error={touched.password ? errors.password : ''}
            disabled={submitting}
          />

          <Field
            id="signup-confirm"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
            Icon={IconLock}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            disabled={submitting}
          />

          <button type="submit" disabled={!canSubmit} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition duration-200 hover:-translate-y-0.5 disabled:opacity-60">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                Creating…
              </span>
            ) : (
              'Create account'
            )}
          </button>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-400">Already have an account?</span>
            <Link to="/login" className="font-medium text-amber-200 no-underline hover:text-amber-100">
              Sign in
            </Link>
          </div>
        </form>

        <div className="mt-6 rounded-[var(--ds-radius-md)] border border-slate-700 bg-slate-950 p-3 text-xs text-slate-400">
          Create your account to start learning immediately.
        </div>
      </div>
    </div>
  );
}
