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
          </nav>

          <button
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            Menu
          </button>
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
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-red-100 bg-zinc-950 text-zinc-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <div className="mb-2 text-lg font-black text-white">UMU Sports</div>
            <p className="text-sm text-zinc-400">
              Uganda Martyrs University Sports Department — supporting student-athletes on and off the field.
            </p>
          </div>

          <div>
            <div className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-red-400">Quick Links</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/fixtures" className="hover:text-white">Fixtures</Link></li>
              <li><Link to="/results" className="hover:text-white">Results</Link></li>
              <li><Link to="/events" className="hover:text-white">Events</Link></li>
              <li><Link to="/news" className="hover:text-white">News</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-red-400">Contact</div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Nkozi Main Campus, Mpigi, Uganda</li>
              <li>sports@umu.ac.ug</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
          © 2026 Uganda Martyrs University Sports Department
        </div>
      </footer>
    </div>
  );
}
