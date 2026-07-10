import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = <HelpCircle size={40} className="text-slate-400 dark:text-slate-600" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl max-w-lg mx-auto">
      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};
