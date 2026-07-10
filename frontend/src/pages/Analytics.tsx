import React from 'react';
import { BarChart3, Globe2, RefreshCw, Smartphone } from 'lucide-react';

import { Button } from '@ui/Button.js';
import { Card } from '@ui/Card.js';

export const Analytics: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Advanced Link Telemetry
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Monitor real-time redirections, device distributions, and geographic details.
          </p>
        </div>

        <Button variant="secondary" size="sm" className="flex items-center gap-2">
          <RefreshCw size={14} />
          Sync Reports
        </Button>
      </div>

      {/* Grid container of breakdown slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center text-center py-12">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl mb-4 text-indigo-600 dark:text-indigo-400">
            <Globe2 size={24} />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Country Geo Analytics
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mb-0">
            Geographic click distribution datasets will mount here.
          </p>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center py-12">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl mb-4 text-emerald-600 dark:text-emerald-400">
            <Smartphone size={24} />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Devices & Browsers Metrics
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mb-0">
            User-Agent telemetry breakdowns (Mobile, Desktop, OS) will mount here.
          </p>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center py-12 md:col-span-2 lg:col-span-1">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl mb-4 text-amber-600 dark:text-amber-400">
            <BarChart3 size={24} />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Referrer Trailing Traffic
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mb-0">
            Referrer logs (Direct, Social Networks, Search Engines) will mount here.
          </p>
        </Card>
      </div>
    </div>
  );
};
export default Analytics;
