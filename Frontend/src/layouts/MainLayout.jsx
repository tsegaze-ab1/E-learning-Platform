import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/cn.js';

function TopNavLink({ to, label, onClick, lightMode = false }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'rounded-xl px-3 py-2 text-sm font-medium no-underline transition',
          isActive
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
            : lightMode
              ? 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white',
        )
      }
      end={to === '/'}
    >
      {label}
    </NavLink>
  );
}

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('theme') ?? 'dark';
  });
  const location = useLocation();

  const isLight = theme === 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const isAuthPage = useMemo(
    () => location.pathname === '/login' || location.pathname === '/signup',
    [location.pathname],
  );

  return (
    <div className="min-h-dvh" style={{ background: 'var(--ds-bg)' }}>
      <header className={cn(
        'sticky top-0 z-40 border-b backdrop-blur',
        isLight ? 'border-slate-200 bg-white/90' : 'border-slate-800/70 bg-slate-950/90',
      )}>
        <div className="ds-container flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="group flex items-center gap-2 no-underline">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25">
                E
              </span>
              <span className={cn('truncate text-sm font-semibold tracking-tight', isLight ? 'text-slate-900' : 'text-white')}>
                C++ Learning
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <TopNavLink to="/" label="Home" lightMode={isLight} />
            <TopNavLink to="/student" label="Student" lightMode={isLight} />
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {!isAuthPage ? (
                <>
                  <Link to="/login" className={cn(
                    'inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium no-underline transition',
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:border-amber-400/40 hover:text-amber-700'
                      : 'border-slate-700 text-slate-200 hover:border-amber-400/40 hover:text-amber-200',
                  )}>
                    Login
                  </Link>
                  <Link to="/signup" className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-sm font-semibold text-slate-950 no-underline shadow-lg shadow-amber-500/25 transition duration-200 hover:-translate-y-0.5">
                    Sign up
                  </Link>
                </>
              ) : (
                <Link to="/" className={cn(
                  'inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium no-underline transition',
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:border-amber-400/40 hover:text-amber-700'
                    : 'border-slate-700 text-slate-200 hover:border-amber-400/40 hover:text-amber-200',
                )}>
                  Back to home
                </Link>
              )}
            </div>

            <button
              type="button"
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium md:hidden',
                isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-900',
              )}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Open menu"
            >
              Menu
            </button>
          </div>
        </div>

        <div
          className={cn(
            'md:hidden overflow-hidden border-t transition-[max-height] duration-200',
            isLight ? 'border-slate-200 bg-white' : 'border-slate-800/70 bg-slate-950',
            open ? 'max-h-64' : 'max-h-0',
          )}
        >
          <div className="ds-container flex flex-col gap-1 py-2">
            <TopNavLink to="/" label="Home" onClick={() => setOpen(false)} lightMode={isLight} />
            <TopNavLink to="/student" label="Student" onClick={() => setOpen(false)} lightMode={isLight} />
            <div className="mt-2 flex items-center gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className={cn(
                'inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium no-underline transition',
                isLight
                  ? 'border-slate-300 text-slate-700 hover:border-amber-400/40 hover:text-amber-700'
                  : 'border-slate-700 text-slate-200 hover:border-amber-400/40 hover:text-amber-200',
              )}>
                Login
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-sm font-semibold text-slate-950 no-underline shadow-lg shadow-amber-500/25">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className={cn(location.pathname === '/' ? 'py-0' : 'ds-container py-8 text-slate-100')}>
        <Outlet />
      </main>
    </div>
  );
}
