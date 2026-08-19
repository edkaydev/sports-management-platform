import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, ROLE_DOT_COLORS, ROLE_BADGE_COLORS_LIGHT } from '@/lib/constants';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6" role="banner">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-umu-red lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="hidden items-center gap-2 lg:flex">
          <img src="/umu-logo.png" alt="UMU" className="h-7 w-7 object-contain" />
          <span className="text-sm font-semibold text-gray-700">Uganda Martyrs University</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-umu-red"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              ROLE_DOT_COLORS[user?.role ?? 'TUTOR'] || 'bg-gray-400'
            )}
          />
          <span className="hidden sm:inline text-sm font-medium text-gray-700">
            {ROLE_LABELS[user?.role ?? 'TUTOR']}
          </span>
        </div>

        <div className="hidden items-center gap-2 border-l border-gray-200 pl-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                ROLE_BADGE_COLORS_LIGHT[user?.role ?? 'TUTOR']
              )}
            >
              {ROLE_LABELS[user?.role ?? 'TUTOR']}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-md bg-umu-red/5 px-3 py-2 text-sm font-medium text-umu-red transition-colors hover:bg-umu-red/10 focus:outline-none focus:ring-2 focus:ring-umu-red"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
