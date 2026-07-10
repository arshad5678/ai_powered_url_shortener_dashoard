import React from 'react';
import { Key, Save, ShieldAlert } from 'lucide-react';

import { Button } from '@ui/Button.js';
import { Card } from '@ui/Card.js';

export const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
          System Settings
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Configure Gemini AI credentials, system parameters, and connection metrics.
        </p>
      </div>

      {/* Settings cards list */}
      <div className="flex flex-col gap-6 max-w-3xl">
        {/* API keys config */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Key size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200">
              API Credentials
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value="••••••••••••••••••••••••••••"
                disabled
                className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none select-none text-slate-500 cursor-not-allowed max-w-md"
              />
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                Used to generate short case-sensitive suggestions from titles. Bypassed in mock test runs.
              </span>
            </div>
          </div>
        </Card>

        {/* System safety */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldAlert size={18} className="text-red-500" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200">
              Security Mappings
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight">
                  Enforce Rate Limiting
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-sm mt-0.5">
                  Restricts excessive client redirection payloads to prevent scraping bots.
                </span>
              </div>
              <div className="h-5 w-9 rounded-full bg-indigo-600 flex items-center justify-end px-1 cursor-pointer">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm">
            Reset Changes
          </Button>
          <Button variant="primary" size="sm" className="flex items-center gap-2">
            <Save size={14} />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Settings;
