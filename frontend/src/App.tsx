import React from 'react';
import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext.js';
import { ErrorBoundary } from './components/layout/ErrorBoundary.js';
import { router } from './routes/index.js';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
};
export default App;
