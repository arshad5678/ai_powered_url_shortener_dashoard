import React from 'react';
import { ArrowUpRight, Calendar, Link2, MousePointerClick, RefreshCw } from 'lucide-react';

import { Button } from '../components/common/Button.js';
import { Card } from '../components/common/Card.js';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Active Links',
      value: '1,280',
      change: '+12.5%',
      isPositive: true,
      icon: <Link2 className="text-indigo-600 dark:text-indigo-400" size={20} />,
    },
    {
      title: 'Total Clicks Redirected',
      value: '84,204',
      change: '+28.4%',
      isPositive: true,
      icon: <MousePointerClick className="text-emerald-600 dark:text-emerald-400" size={20} />,
    },
    {
      title: 'Today\'s Clicks',
      value: '3,150',
      change: '-4.2%',
      isPositive: false,
      icon: <Calendar className="text-amber-600 dark:text-amber-400" size={20} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Welcome back! Here's a quick summary of your url shortened analytics.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <RefreshCw size={14} />
            Sync Stats
          </Button>
          <Button variant="primary" size="sm" className="flex items-center gap-2">
            Create Link
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>

      {/* Stats grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-1">
                {stat.title}
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-50 leading-tight">
                {stat.value}
              </span>
              <span
                className={`text-[10px] font-bold mt-1.5 ${
                  stat.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}
              >
                {stat.change} vs last month
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
              {stat.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Placeholders for upcoming features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-center items-center text-center py-10">
          <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-3">
            📊
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Redirection Analytics Chart
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs">
            Interactive chart visualizations will load here once the data services are connected.
          </p>
        </Card>

        <Card className="flex flex-col justify-center items-center text-center py-10">
          <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-3">
            🚀
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Top Performing Link Slugs
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs">
            A sorted ranking of click volume analytics will display here.
          </p>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
