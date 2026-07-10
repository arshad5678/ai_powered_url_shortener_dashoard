import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Link2, Settings, Sparkles } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const links = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/links', label: 'Links', icon: <Link2 size={18} /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col transition-transform duration-300
    lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Brand/Logo */}
        <div className="flex items-center gap-2 mb-8 select-none">
          <div className="p-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              BookingJini
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold dark:text-slate-500 tracking-wider uppercase">
              URL Shortener
            </span>
          </div>
        </div>

        {/* Routes links */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all select-none ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Info/Card */}
        <div className="mt-auto bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center">
          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 leading-tight">
            AI-Powered Slugs
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0">
            Powered by Google Gemini
          </p>
        </div>
      </aside>
    </>
  );
};
