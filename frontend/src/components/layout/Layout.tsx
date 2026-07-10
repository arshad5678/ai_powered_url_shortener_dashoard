import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import { Footer } from './Footer.js';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar headers */}
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/40">
          <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">
            <Outlet />
          </div>
        </main>

        {/* Footer info logs */}
        <Footer />
      </div>
    </div>
  );
};
export default Layout;
