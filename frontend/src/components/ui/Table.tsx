import React from 'react';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
}

export function Table<T>({ columns, data, isLoading = false }: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600 border-r-2 border-b-transparent border-l-transparent mb-2" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Loading table data...</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850">
            {columns.map((column, i) => (
              <th
                key={i}
                className={`px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                  column.className || ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                {columns.map((column, j) => (
                  <td key={j} className={`px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300 ${column.className || ''}`}>
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
