import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/sports', label: 'Sports' },
  { to: '/teams', label: 'Teams' },
  { to: '/fixtures', label: 'Fixtures' },
  { to: '/results', label: 'Results' },
  { to: '/events', label: 'Events' },
  { to: '/news', label: 'News' },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Pill header — floats and elevates on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-2.5' : 'py-4'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between rounded-full border transition-all duration-300 px-2 sm:px-3 py-1.5 ${
            scrolled
              ? 'bg-white/90 backdrop-blur-xl border-outline shadow-m3-2 max-w-5xl'
              : 'bg-white/70 backdrop-blur-lg border-transparent max-w-6xl'
          }`}
          style={{ margin: '0 auto' }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 pl-3 pr-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-umu-red text-[11px] font-bold text-white shadow-sm">
              UMU
            </span>
            <span className="hidden sm:inline text-[15px] font-semibold text-on-surface tracking-tight">
              UMU Sports
            </span>
          </Link>

          {/* Desktop pill nav */}
          <nav className="hidden items-center gap-0.5 xl:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-umu-red text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-umu-red -z-10 animate-fade-in" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5 pr-1 shrink-0">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-umu-red px-5 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-umu-red-dark hover:shadow-m3-1 active:scale-[0.97]"
            >
              Sign in
            </Link>

            <Link
              to="/login"
              className="sm:hidden rounded-full bg-umu-red px-4 py-2 text-[13px] font-medium text-white active:scale-[0.97]"
            >
              Sign in
            </Link>

            {/* Mobile hamburger */}
            <button
              className="xl:hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container transition"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="mt-2 mx-4 rounded-3xl border border-outline bg-white/95 backdrop-blur-xl shadow-m3-3 p-3 xl:hidden animate-fade-in">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center rounded-2xl px-5 py-3.5 text-[15px] font-medium transition ${
                      isActive
                        ? 'bg-umu-red text-white'
                        : 'text-on-surface hover:bg-surface-container'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-2 border-t border-outline-variant pt-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-umu-red px-5 py-3.5 text-[15px] font-medium text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface-dim">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-umu-red text-sm font-bold text-white">
                UMU
              </span>
              <span className="text-lg font-semibold text-on-surface">UMU Sports</span>
            </div>
            <p className="max-w-xs text-[14px] leading-relaxed text-on-surface-variant">
              Uganda Martyrs University Sports Department — supporting student-athletes on and off the field.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Quick Links</h4>
            <ul className="space-y-2.5 text-[14px]">
              <li><Link to="/fixtures" className="text-on-surface-variant hover:text-umu-red transition">Fixtures</Link></li>
              <li><Link to="/results" className="text-on-surface-variant hover:text-umu-red transition">Results</Link></li>
              <li><Link to="/events" className="text-on-surface-variant hover:text-umu-red transition">Events</Link></li>
              <li><Link to="/news" className="text-on-surface-variant hover:text-umu-red transition">News</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Athletics</h4>
            <ul className="space-y-2.5 text-[14px]">
              <li><Link to="/teams" className="text-on-surface-variant hover:text-umu-red transition">Teams</Link></li>
              <li><Link to="/sports" className="text-on-surface-variant hover:text-umu-red transition">Sports</Link></li>
              <li><Link to="/login" className="text-on-surface-variant hover:text-umu-red transition">Student login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Contact</h4>
            <ul className="space-y-2.5 text-[14px] text-on-surface-variant">
              <li>Nkozi Main Campus, Mpigi, Uganda</li>
              <li>sports@umu.ac.ug</li>
            </ul>
            <Link
              to="/login"
              className="mt-5 inline-flex items-center rounded-full bg-umu-red px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-umu-red-dark"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="border-t border-outline-variant py-5 text-center text-[12px] text-on-surface-variant">
          &copy; 2026 Uganda Martyrs University Sports Department
        </div>
      </footer>
    </div>
  );
}
