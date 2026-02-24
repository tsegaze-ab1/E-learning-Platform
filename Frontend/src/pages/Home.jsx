import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import Badge from '../components/ui/Badge.jsx';
import TentacleBackground from '../components/TentacleBackground.jsx';

export default function Home() {
  const { firebaseUser, profile } = useAuth();
  const role = profile?.role;

  let primaryTo = '/signup';
  let primaryLabel = 'Create free account';

  if (firebaseUser) {
    if (role === 'admin') {
      primaryTo = '/admin/content';
      primaryLabel = 'Go to admin content';
    } else {
      primaryTo = '/student';
      primaryLabel = 'Go to student dashboard';
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove('opacity-0', 'translate-y-6');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    const targets = document.querySelectorAll('[data-reveal]');
    targets.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative isolate scroll-smooth bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <TentacleBackground />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_22%_18%,rgba(255,0,200,0.12),transparent_42%),radial-gradient(circle_at_78%_72%,rgba(250,220,70,0.14),transparent_45%)]" />

      <section className="relative overflow-hidden border-b border-slate-800/70 bg-gradient-to-br from-slate-950/70 via-slate-900/72 to-slate-950/70 backdrop-blur-[1.5px]">
        <div className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-orange-400/12 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl" />

        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <div data-reveal className="translate-y-6 space-y-8 opacity-0 transition-all duration-700">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-amber-400/35 bg-amber-400/10 text-amber-200">Premium SaaS</Badge>
              <Badge className="border-amber-400/35 bg-orange-400/10 text-orange-200">C++ Focused</Badge>
              <Badge className="border-slate-700 bg-slate-900/70 text-slate-300">Student + Admin</Badge>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                C++ Learning for serious builders.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                C++ Learning combines modern lessons, guided practice, and role-based dashboards so
                students and admins can focus on growth with a world-class experience.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={primaryTo}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-semibold text-slate-950 no-underline shadow-lg shadow-amber-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25"
              >
                {primaryLabel}
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 px-5 text-sm font-semibold text-slate-100 no-underline transition duration-200 hover:border-amber-400/40 hover:text-amber-200"
              >
                Watch Demo
              </a>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur">
                <div className="text-xl font-bold text-white">50K+</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">Active learners</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur">
                <div className="text-xl font-bold text-white">1.2M</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">Lessons completed</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur">
                <div className="text-xl font-bold text-white">4.9/5</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">Learner rating</p>
              </div>
            </div>

            {firebaseUser ? (
              <p className="text-xs text-slate-400">
                Signed in as <span className="font-medium text-slate-200">{firebaseUser.email}</span>
                {role ? (
                  <>
                    {' '}
                    • <span className="font-medium text-slate-200">{role}</span>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-amber-200 no-underline hover:text-amber-100">
                  Sign in
                </Link>
              </p>
            )}
          </div>

        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div data-reveal className="translate-y-6 text-center opacity-0 transition-all duration-700">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Powerful features, minimal friction</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Every part of the platform is optimized for faster learning outcomes and smoother operations.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Smart Course Flow',
              body: 'Progress through clean lessons with consistent structure and focused outcomes.',
            },
            {
              title: 'Admin Control',
              body: 'Create and manage content quickly with secure role-based permissions.',
            },
            {
              title: 'Media-Ready',
              body: 'Blend YouTube lessons and audio materials into a premium study experience.',
            },
            {
              title: 'Built for Scale',
              body: 'Production-ready architecture for teams, schools, and growing academies.',
            },
          ].map((feature) => (
            <article
              key={feature.title}
              data-reveal
              className="translate-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 opacity-0 backdrop-blur transition-all duration-700 hover:-translate-y-1 hover:border-amber-400/40"
            >
              <span className="inline-flex h-8 items-center rounded-full border border-amber-400/35 bg-amber-400/10 px-3 text-xs font-semibold text-amber-200">
                Feature
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-800/70 bg-slate-900/38 backdrop-blur-[1px]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div data-reveal className="translate-y-6 text-center opacity-0 transition-all duration-700">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">
              Start quickly in a clear, step-by-step workflow designed for confidence.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: 'Create account', body: 'Sign up and choose your learning role in seconds.' },
              { step: '02', title: 'Choose track', body: 'Open curated C++ lessons tailored to your level.' },
              { step: '03', title: 'Learn deeply', body: 'Watch videos, replay audio, and absorb concepts faster.' },
              { step: '04', title: 'Track progress', body: 'Use your dashboard to stay focused and consistent.' },
            ].map((item) => (
              <article
                key={item.step}
                data-reveal
                className="translate-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 opacity-0 transition-all duration-700 hover:border-amber-400/35"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-slate-950">
                  {item.step}
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div data-reveal className="translate-y-6 opacity-0 transition-all duration-700">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Trusted by learners and teams</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Premium learning experiences backed by secure infrastructure and measurable results.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {[
            {
              quote: 'The platform feels premium and keeps our students engaged every day.',
              by: 'Learning Manager, Tech Academy',
            },
            {
              quote: 'Our admin team can publish courses fast without sacrificing quality.',
              by: 'Operations Lead, Skill Studio',
            },
            {
              quote: 'The dark UI and clean flow make serious C++ study feel effortless.',
              by: 'Senior Instructor, Dev Bootcamp',
            },
          ].map((item) => (
            <article
              key={item.by}
              data-reveal
              className="translate-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 opacity-0 transition-all duration-700"
            >
              <p className="text-sm leading-7 text-slate-200">“{item.quote}”</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-amber-200">{item.by}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800/70 bg-gradient-to-r from-amber-500/14 via-slate-900/65 to-fuchsia-500/12 backdrop-blur-[1px]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div data-reveal className="translate-y-6 opacity-0 transition-all duration-700">
            <h3 className="text-2xl font-semibold tracking-tight text-white">Build real C++ skills with confidence</h3>
            <p className="mt-2 text-slate-300">Join a premium learning platform designed for performance and growth.</p>
          </div>

          <Link
            to={primaryTo}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-semibold text-slate-950 no-underline shadow-lg shadow-amber-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25"
          >
            {primaryLabel}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950/78 backdrop-blur-[1px]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} C++ Learning. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#features" className="no-underline transition hover:text-amber-200">
              Features
            </a>
            <a href="#how-it-works" className="no-underline transition hover:text-amber-200">
              How it works
            </a>
            <Link to="/login" className="no-underline transition hover:text-amber-200">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
