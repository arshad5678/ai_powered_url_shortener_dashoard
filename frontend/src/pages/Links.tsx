import React from 'react';
import { Copy, Edit2, ExternalLink, Plus, Search, Trash } from 'lucide-react';

import { Button } from '../components/common/Button.js';
import { Table } from '../components/common/Table.js';
import { Pagination } from '../components/common/Pagination.js';

interface LinkMock {
  id: string;
  title: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  status: 'active' | 'disabled' | 'expired';
}

export const Links: React.FC = () => {
  const mockLinks: LinkMock[] = [
    {
      id: '1',
      title: 'Summer Sale Deals',
      originalUrl: 'https://example.com/products/summer-sale-deals-tracker',
      shortUrl: 'http://localhost:5173/r/sumsal',
      clicks: 1250,
      status: 'active',
    },
    {
      id: '2',
      title: 'Winter Promotion Code',
      originalUrl: 'https://example.com/winter-promo-code',
      shortUrl: 'http://localhost:5173/r/wint26',
      clicks: 840,
      status: 'disabled',
    },
    {
      id: '3',
      title: 'Spring Discount Campaigns',
      originalUrl: 'https://example.com/spring-discounts-camp',
      shortUrl: 'http://localhost:5173/r/spring',
      clicks: 0,
      status: 'expired',
    },
  ];

  const columns = [
    {
      header: 'Title & Destination',
      accessor: (row: LinkMock) => (
        <div className="flex flex-col gap-1 max-w-xs md:max-w-md">
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{row.title}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate select-all">{row.originalUrl}</span>
        </div>
      ),
    },
    {
      header: 'Short URL',
      accessor: (row: LinkMock) => (
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold select-all">{row.shortUrl}</span>
          <button
            onClick={() => navigator.clipboard.writeText(row.shortUrl)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            title="Copy URL"
          >
            <Copy size={12} />
          </button>
        </div>
      ),
    },
    {
      header: 'Clicks',
      accessor: (row: LinkMock) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">{row.clicks}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: LinkMock) => {
        const styles = {
          active: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30',
          disabled: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/30',
          expired: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/30',
        };
        return (
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${styles[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: LinkMock) => (
        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer" title="Edit Metadata">
            <Edit2 size={13} />
          </button>
          <a
            href={row.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center"
            title="Open Link"
          >
            <ExternalLink size={13} />
          </a>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500 dark:text-red-400 cursor-pointer" title="Delete Link">
            <Trash size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            My Shortened Links
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Manage your link shorteners, custom aliases, and status limits.
          </p>
        </div>

        <Button variant="primary" size="sm" className="flex items-center gap-2">
          <Plus size={14} />
          Add Link
        </Button>
      </div>

      {/* Filter and search actions bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-600" />
          <input
            placeholder="Search links title or alias..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Main Table view */}
      <Table columns={columns} data={mockLinks} />

      {/* Pagination wrapper */}
      <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
    </div>
  );
};
export default Links;
