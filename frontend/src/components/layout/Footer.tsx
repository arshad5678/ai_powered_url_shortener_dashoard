import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950 transition-colors">
      <span>
        &copy; {new Date().getFullYear()} BookingJini URL Shortener. Designed for SDE-1 Assessment.
      </span>
    </footer>
  );
};
