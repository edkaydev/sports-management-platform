import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar
        collapsed={false}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          role="main"
          aria-label="Page content"
          key={location.pathname}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
