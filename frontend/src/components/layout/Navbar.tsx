import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';

import { useTheme } from '../../contexts/ThemeContext.js';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors z-20 relative">
      {/* Left section: mobile toggle menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden md:block">
          SDE-1 AI Assessment
        </div>
      </div>

      {/* Right section: theme switcher and profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Profile indicator placeholder */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4 select-none">
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
            AB
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Arshad Basha
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
              Software Engineer
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
