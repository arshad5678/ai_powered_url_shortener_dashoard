import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-indigo-600 border-r-3 border-b-transparent border-l-transparent mb-4" />
      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
        Loading view content...
      </span>
    </div>
  );
};
export default Loading;
