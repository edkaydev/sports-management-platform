import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  ClipboardList,
  GraduationCap,
  Award,
  FileText,
  Search,
  ClipboardCheck,
  Bell,
  BarChart3,
  Newspaper,
  Image,
  Package,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, ROLE_BADGE_COLORS_DARK } from '@/lib/constants';


interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  tutorOnly?: boolean;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: '',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Athletes',
    items: [
      { to: '/athletes', label: 'All Athletes', icon: Users },
    ],
  },
  {
    title: 'Teams & Sports',
    items: [
      { to: '/teams-admin', label: 'Teams', icon: Trophy },
      { to: '/sports-admin', label: 'Sports', icon: Trophy },
    ],
  },
  {
    title: 'Competition',
    items: [
      { to: '/events-admin', label: 'Events & Competitions', icon: Calendar },
      { to: '/tournaments/new', label: 'Create Tournament / Gala', icon: Trophy },
      { to: '/matches', label: 'Fixtures & Matches', icon: ClipboardList },
    ],
  },
  {
    title: 'Academic & Finance',
    items: [
      { to: '/academic', label: 'Academic Performance', icon: GraduationCap },
      { to: '/scholarships', label: 'Scholarships', icon: Award },
      { to: '/contracts', label: 'Contracts', icon: FileText },
    ],
  },
  {
    title: 'Recruitment',
    items: [
      { to: '/prospects', label: 'Prospects', icon: Search },
      { to: '/trials', label: 'Trials', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/documents', label: 'Documents', icon: FileText },
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/news/manage', label: 'News & Announcements', icon: Newspaper },
      { to: '/slides/manage', label: 'Home Slider', icon: Image },
      { to: '/equipment', label: 'Department Equipment', icon: Package, tutorOnly: true },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center border-b border-white/10 px-4', collapsed ? 'justify-center' : 'gap-3 px-6')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          <img src="/umu-logo.png" alt="UMU" className="h-full w-full object-contain" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide text-white">UMU Sports</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-umu-gold">Management</span>
          </div>
        )}
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto" aria-label="Main navigation">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.tutorOnly || hasRole('TUTOR'));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.title || 'main'}>
              {group.title && (
                <p className={cn('mb-1 mt-4 text-[10px] font-semibold uppercase tracking-wider text-gray-500', collapsed && 'text-center')}>
                  {collapsed ? '---' : group.title}
                </p>
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-umu-red focus:ring-offset-2 focus:ring-offset-gray-900',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-umu-red text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className={cn('border-t border-white/10 p-4', collapsed && 'px-2')}>
        {!collapsed && user && (
          <div className="mb-3 rounded-lg bg-gray-800 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
            <span
              className={cn(
                'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white',
                ROLE_BADGE_COLORS_DARK[user.role] || 'bg-gray-500'
              )}
            >
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden flex-shrink-0 bg-gray-900 text-white transition-all duration-200 lg:block',
          collapsed ? 'w-20' : 'w-64'
        )}
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      <div className={cn('lg:hidden', mobileOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onMobileClose} aria-hidden="true" />
        <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 text-white transition-transform duration-200" aria-label="Mobile navigation">
          <div className="absolute right-2 top-3.5">
            <button
              onClick={onMobileClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-umu-red"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
