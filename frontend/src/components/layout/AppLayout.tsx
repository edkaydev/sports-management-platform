import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const navGroups: Array<{ title?: string; items: Array<{ to: string; label: string }> }> = [
  {
    items: [{ to: '/', label: 'Dashboard' }],
  },
  {
    title: 'Athletes',
    items: [
      { to: '/athletes', label: 'All Athletes' },
      { to: '/athletes/new', label: 'Add Athlete' },
    ],
  },
  {
    title: 'Teams & Sports',
    items: [
      { to: '/teams', label: 'Teams' },
      { to: '/sports', label: 'Sports' },
    ],
  },
  {
    title: 'Competition',
    items: [
      { to: '/events', label: 'Events & Competitions' },
      { to: '/matches', label: 'Fixtures & Matches' },
    ],
  },
  {
    title: 'Academic & Finance',
    items: [
      { to: '/academic', label: 'Academic Performance' },
      { to: '/scholarships', label: 'Scholarships' },
      { to: '/contracts', label: 'Contracts' },
    ],
  },
  {
    title: 'Recruitment',
    items: [
      { to: '/prospects', label: 'Prospects' },
      { to: '/trials', label: 'Trials' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/documents', label: 'Documents' },
      { to: '/notifications', label: 'Notifications' },
      { to: '/reports', label: 'Reports' },
    ],
  },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-surface border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-4 border-b border-border">
          <div className="font-semibold text-gray-900">UMU Sports</div>
          <div className="text-xs text-muted">Sports Department</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navGroups.map((group, i) => (
            <div key={i} className="mb-4">
              {group.title && (
                <div className="px-5 mb-1 text-xs font-medium text-muted uppercase tracking-wide">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-5 py-1.5 text-sm border-l-2 ${
                      isActive
                        ? 'border-primary text-primary bg-blue-50/50 font-medium'
                        : 'border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-border text-xs text-muted">
          UMU Sports v1.0
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const res = await api.get('/notifications', { params: { pageSize: 1 } });
      return res.data.unreadCount as number;
    },
    refetchInterval: 60000,
  });

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-gray-600 hover:text-gray-900"
          onClick={onMenu}
          aria-label="Open menu"
        >
          Menu
        </button>
        <h2 className="text-base font-semibold text-gray-900">Sports Department</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="relative text-sm text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/notifications')}
        >
          Notifications
          {(notifications ?? 0) > 0 && (
            <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-medium">
              {notifications}
            </span>
          )}
        </button>
        <div className="relative">
          <button
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
              {user?.fullName?.charAt(0) ?? 'U'}
            </span>
            <span className="hidden sm:inline">{user?.fullName}</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-sm py-1 z-40">
              <div className="px-4 py-2 border-b border-border">
                <div className="text-sm font-medium text-gray-900">{user?.fullName}</div>
                <div className="text-xs text-muted">{user?.role}</div>
              </div>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-50"
                onClick={() => {
                  signOut();
                  navigate('/login');
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-page">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-60">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
