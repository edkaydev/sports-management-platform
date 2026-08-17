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
      <header className="sticky top-0 z-30 bg-primary text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
              UMU
            </span>
            <span className="font-bold text-lg tracking-tight">UMU Sports</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="md:hidden px-3 py-2 text-sm font-medium text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
        {open && (
          <nav className="md:hidden border-t border-white/20 px-4 pb-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-sm font-medium ${isActive ? 'text-white' : 'text-blue-100'}`
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

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-bold text-white mb-2">UMU Sports</div>
            <p className="text-sm text-gray-400">
              Uganda Martyrs University Sports Department — supporting student-athletes on and off the field.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white mb-2">Quick Links</div>
            <ul className="space-y-1 text-sm">
              <li><Link to="/fixtures" className="hover:text-white">Fixtures</Link></li>
              <li><Link to="/results" className="hover:text-white">Results</Link></li>
              <li><Link to="/events" className="hover:text-white">Events</Link></li>
              <li><Link to="/news" className="hover:text-white">News</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-2">Contact</div>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>Nkozi Main Campus, Mpigi, Uganda</li>
              <li>sports@umu.ac.ug</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 text-center text-xs text-gray-500 py-4">
          © 2026 Uganda Martyrs University Sports Department
        </div>
      </footer>
    </div>
  );
}
