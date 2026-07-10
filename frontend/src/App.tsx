import React from 'react';
import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext.js';
import { ToastProvider } from './contexts/ToastContext.js';
import { ErrorBoundary } from './components/layout/ErrorBoundary.js';
import { router } from './routes/index.js';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
export default App;
