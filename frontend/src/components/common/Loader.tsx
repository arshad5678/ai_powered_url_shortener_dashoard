import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div
        className={`animate-spin rounded-full border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent ${sizeClasses[size]}`}
      />
    </div>
  );
};
