import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-powered-url-shortener-dashoard.onrender.com';

export const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();

  useEffect(() => {
    if (shortCode) {
      // Clean safety check to prevent looping on known static frontend pages
      const reserved = ['links', 'analytics', 'settings', 'dashboard'];
      if (reserved.includes(shortCode.toLowerCase())) {
        window.location.href = '/';
        return;
      }
      
      // Redirect to the backend redirect route
      window.location.href = `${API_URL}/r/${shortCode}`;
    }
  }, [shortCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center select-none animate-pulse">
      <div className="text-sm font-bold text-indigo-650 dark:text-indigo-400">
        Redirecting you to your destination...
      </div>
    </div>
  );
};

export default RedirectHandler;
