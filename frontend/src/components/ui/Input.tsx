import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-800 focus:ring-indigo-500 dark:focus:ring-indigo-400'
          } rounded-lg outline-none focus:ring-2 focus:ring-offset-0 transition-all dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-400 dark:text-slate-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
