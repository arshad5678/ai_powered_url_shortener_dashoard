import { createBrowserRouter } from 'react-router-dom';

import { Layout } from '../components/layout/Layout.js';
import { Dashboard } from '../pages/Dashboard.js';
import { Links } from '../pages/Links.js';
import { Analytics } from '../pages/Analytics.js';
import { Settings } from '../pages/Settings.js';
import { NotFound } from '../pages/NotFound.js';
import { RedirectHandler } from '../pages/RedirectHandler.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'links',
        element: <Links />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: ':shortCode',
    element: <RedirectHandler />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
export default router;
