import React, { useEffect, useState } from 'react';
import { Copy, Edit2, ExternalLink, Plus, Search, Trash } from 'lucide-react';

import { Button } from '@ui/Button.js';
import { Table } from '@ui/Table.js';
import { Pagination } from '@ui/Pagination.js';
import { CreateLinkModal } from '../components/links/CreateLinkModal.js';
import { api } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.js';
import { Link } from '../types/index.js';

export const Links: React.FC = () => {
  const { showToast } = useToast();
  
  // State variables
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1); // Reset to page 1 on search change
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        limit,
      };
      if (searchDebounced) {
        params.search = searchDebounced;
      }

      const res = await api.get('/api/links', { params });
      
      if (res.data?.success) {
        setLinks(res.data.data.data);
        setTotalPages(res.data.data.meta.totalPages);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch links';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [page, searchDebounced, refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Short URL copied to clipboard!', 'success');
  };

  const getStatusText = (linkItem: Link): 'active' | 'disabled' | 'expired' => {
    if (!linkItem.isActive) return 'disabled';
    if (linkItem.expiresAt && new Date(linkItem.expiresAt) < new Date()) return 'expired';
    return 'active';
  };

  const columns = [
    {
      header: 'Title & Destination',
      accessor: (row: Link) => (
        <div className="flex flex-col gap-1 max-w-xs md:max-w-md">
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{row.title}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate select-all">{row.originalUrl}</span>
        </div>
      ),
    },
    {
      header: 'Short URL',
      accessor: (row: Link) => (
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold select-all">{row.shortUrl}</span>
          <button
            onClick={() => handleCopy(row.shortUrl)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            title="Copy URL"
          >
            <Copy size={12} />
          </button>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Link) => {
        const status = getStatusText(row);
        const styles = {
          active: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30',
          disabled: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/30',
          expired: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/30',
        };
        return (
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${styles[status]}`}>
            {status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: Link) => (
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

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2"
        >
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Main Table view */}
      <Table columns={columns} data={links} isLoading={loading} />

      {/* Pagination wrapper */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Reusable creation modal */}
      <CreateLinkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};
export default Links;
