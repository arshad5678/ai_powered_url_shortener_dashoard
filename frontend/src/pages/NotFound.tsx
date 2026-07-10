import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

import { Button } from '../components/common/Button.js';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center select-none">
      {/* Brand Icon */}
      <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6">
        <Sparkles size={32} />
      </div>

      <h1 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2 leading-none">
        404
      </h1>
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
        Page Not Found
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
        The page you are looking for does not exist or has been relocated to another address.
      </p>

      <Button
        variant="primary"
        size="md"
        onClick={() => navigate('/')}
        className="flex items-center gap-2"
      >
        <Home size={16} />
        Back to Dashboard
      </Button>
    </div>
  );
};
export default NotFound;
