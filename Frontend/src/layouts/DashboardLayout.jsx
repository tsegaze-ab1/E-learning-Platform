import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/cn.js';
import Badge from '../components/ui/Badge.jsx';
import { useEffect, useState } from 'react';

const COURSE_WEEKS = Array.from({ length: 10 }, (_, index) => ({
  label: `week-${index + 1}`,
  to: `/student?week=${index + 1}`,
}));

const QUIZ_WEEKS = Array.from({ length: 10 }, (_, index) => ({
  label: `week-${index + 1} quiz`,
  to: `/student?week=${index + 1}&view=quiz`,
}));

function SidebarItem({ item, onNavigate, isActive }) {
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={cn(
        'block w-full rounded-lg border px-3 py-2 text-left text-xs font-medium no-underline transition',
        isActive
          ? 'border-amber-400/45 bg-amber-500/10 text-amber-200'
          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-amber-400/35 hover:text-amber-200',
      )}
    >
      {item.label}
    </Link>
  );
}

function SidebarSection({ title, open, onToggle, items, pathname, search, onNavigate }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span
          className={cn(
            'text-amber-300 transition-transform duration-200',
            open ? 'rotate-90' : 'rotate-0',
          )}
          aria-hidden="true"
        >
          {'>'}
        </span>
      </button>

      {open ? (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <SidebarItem
              key={item.to}
              item={item}
              onNavigate={onNavigate}
              isActive={`${pathname}${search}` === item.to}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('theme') ?? 'dark';
  });
  const [coursesOpen, setCoursesOpen] = useState(true);
  const [quizzesOpen, setQuizzesOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(true);
  const [mobileQuizzesOpen, setMobileQuizzesOpen] = useState(false);
  const location = useLocation();
  const section = location.pathname.startsWith('/admin/content') ? 'Admin' : 'Student';
  const isLight = theme === 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className={cn(
        'sticky top-0 z-40 border-b backdrop-blur',
        isLight ? 'border-slate-200 bg-white/90' : 'border-slate-800/70 bg-slate-950/90',
      )}>
        <div className="ds-container flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium lg:hidden',
                isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-900',
              )}
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              Menu
            </button>
            <Link to="/" className="flex items-center gap-2 no-underline">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25">
                E
              </span>
              <span className={cn('text-sm font-semibold tracking-tight', isLight ? 'text-slate-900' : 'text-white')}>C++ Learning</span>
            </Link>
            <Badge className="hidden border-amber-400/35 bg-amber-500/15 text-amber-200 sm:inline-flex">
              {section}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className={cn(
              'inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium no-underline transition',
              isLight
                ? 'border-slate-300 text-slate-700 hover:border-amber-400/40 hover:text-amber-700'
                : 'border-slate-700 text-slate-200 hover:border-amber-400/40 hover:text-amber-200',
            )}>
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="ds-container grid gap-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4 backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Learning Menu
            </div>
            <div className="mt-3 space-y-3">
              <SidebarSection
                title="Courses"
                open={coursesOpen}
                onToggle={() => setCoursesOpen((prev) => !prev)}
                items={COURSE_WEEKS}
                pathname={location.pathname}
                search={location.search}
              />
              <SidebarSection
                title="Quizzes"
                open={quizzesOpen}
                onToggle={() => setQuizzesOpen((prev) => !prev)}
                items={QUIZ_WEEKS}
                pathname={location.pathname}
                search={location.search}
              />
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Quick links
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/settings"
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 no-underline transition hover:bg-slate-800"
                >
                  Settings
                </Link>
                <Link
                  to="/help"
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 no-underline transition hover:bg-slate-800"
                >
                  Help
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            'absolute inset-0 bg-black/30 transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        />
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-[84vw] max-w-sm border-r border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25">
                E
              </span>
              <span className="text-sm font-semibold tracking-tight text-white">Menu</span>
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-700 px-3 text-sm font-medium text-slate-200 transition hover:border-amber-400/40 hover:text-amber-200"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              Close
            </button>
          </div>

          <div className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Learning Menu
            </div>
            <div className="mt-3 space-y-3">
              <SidebarSection
                title="Courses"
                open={mobileCoursesOpen}
                onToggle={() => setMobileCoursesOpen((prev) => !prev)}
                items={COURSE_WEEKS}
                pathname={location.pathname}
                search={location.search}
                onNavigate={() => setMobileOpen(false)}
              />
              <SidebarSection
                title="Quizzes"
                open={mobileQuizzesOpen}
                onToggle={() => setMobileQuizzesOpen((prev) => !prev)}
                items={QUIZ_WEEKS}
                pathname={location.pathname}
                search={location.search}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Quick links
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 no-underline transition hover:bg-slate-800"
                >
                  Settings
                </Link>
                <Link
                  to="/help"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-300 no-underline transition hover:bg-slate-800"
                >
                  Help
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/" onClick={() => setMobileOpen(false)} className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-700 text-sm font-medium text-slate-200 no-underline transition hover:border-amber-400/40 hover:text-amber-200">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
