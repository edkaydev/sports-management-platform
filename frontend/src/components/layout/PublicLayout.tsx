import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/fixtures', label: 'Fixtures' },
  { to: '/results', label: 'Results' },
  { to: '/teams', label: 'Teams' },
  { to: '/events', label: 'Events' },
  { to: '/news', label: 'News' },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      <header className="sticky top-0 z-30 border-b border-red-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white shadow-sm">
              UMU
            </span>
            <span className="text-lg font-black tracking-tight text-zinc-900">UMU Sports</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-700 hover:bg-red-50 hover:text-red-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/login"
              className="ml-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
            >
              Login
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/login"
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-bold text-white"
            >
              Login
            </Link>
            <button
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              Menu
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-red-100 bg-white px-4 pb-3 md:hidden">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-sm font-semibold ${isActive ? 'text-red-700' : 'text-zinc-700'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-md bg-red-600 px-3 py-2 text-center text-sm font-bold text-white"
            >
              Login
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-red-100 bg-white text-zinc-700">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white shadow-sm">
                UMU
              </span>
              <div className="text-lg font-black text-zinc-900">UMU Sports</div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-zinc-600">
              Uganda Martyrs University Sports Department — supporting student-athletes on and off the field.
            </p>
          </div>

          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-red-700">Quick Links</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/fixtures" className="text-zinc-600 hover:text-red-700">Fixtures</Link></li>
              <li><Link to="/results" className="text-zinc-600 hover:text-red-700">Results</Link></li>
              <li><Link to="/events" className="text-zinc-600 hover:text-red-700">Events</Link></li>
              <li><Link to="/news" className="text-zinc-600 hover:text-red-700">News</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-red-700">Athletics</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/teams" className="text-zinc-600 hover:text-red-700">Teams</Link></li>
              <li><Link to="/sports" className="text-zinc-600 hover:text-red-700">Sports</Link></li>
              <li><Link to="/login" className="text-zinc-600 hover:text-red-700">Student login</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-red-700">Contact</div>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>Nkozi Main Campus, Mpigi, Uganda</li>
              <li>sports@umu.ac.ug</li>
              <li>
                <Link
                  to="/login"
                  className="mt-2 inline-flex rounded-md bg-red-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-red-100 bg-red-50/60 py-4 text-center text-xs text-zinc-600">
          © 2026 Uganda Martyrs University Sports Department
        </div>
      </footer>
    </div>
  );
}
