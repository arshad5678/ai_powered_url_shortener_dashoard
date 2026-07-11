import React, { useEffect, useState } from 'react';
import {
  Copy,
  Edit2,
  ExternalLink,
  Plus,
  Search,
  Trash,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Link2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@ui/Button.js';
import { Table } from '@ui/Table.js';
import { Pagination } from '@ui/Pagination.js';
import { Badge } from '@ui/Badge.js';
import { EmptyState } from '@ui/EmptyState.js';
import { CreateLinkModal } from '../components/links/CreateLinkModal.js';
import { EditLinkModal } from '../components/links/EditLinkModal.js';
import { DeleteConfirmModal } from '../components/links/DeleteConfirmModal.js';
import { api } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.js';
import { Link } from '../types/index.js';

type StatusFilter = 'all' | 'active' | 'inactive' | 'expired';

type SortOption = 
  | 'newest'
  | 'oldest'
  | 'title-asc'
  | 'title-desc'
  | 'clicks-desc'
  | 'clicks-asc';

export const Links: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // State variables
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  
  // Filters & Sorting Option
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Modals Active State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1); // Reset page on filter/search change
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination page when filters or sorting configurations change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, sortOption]);

  // Fetch paginated link records & fetch telemetry for click aggregates
  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine backend sort parameters
      let sortBy: string | undefined;
      let sortOrder: 'asc' | 'desc' = 'desc';

      if (sortOption === 'newest') {
        sortBy = 'createdAt';
        sortOrder = 'desc';
      } else if (sortOption === 'oldest') {
        sortBy = 'createdAt';
        sortOrder = 'asc';
      } else if (sortOption === 'title-asc') {
        sortBy = 'title';
        sortOrder = 'asc';
      } else if (sortOption === 'title-desc') {
        sortBy = 'title';
        sortOrder = 'desc';
      }

      const params: Record<string, any> = {
        page,
        limit,
        sortOrder,
      };

      if (sortBy) {
        params.sortBy = sortBy;
      }
      if (searchDebounced) {
        params.search = searchDebounced;
      }

      const res = await api.get('/api/links', { params });
      
      if (res.data?.success) {
        const rawLinks = res.data.data.data;

        // Fetch click counts from analytics API for each link
        const linksWithClicks = await Promise.all(
          rawLinks.map(async (linkItem: Link) => {
            try {
              const analyticsRes = await api.get(`/api/analytics/${linkItem.id}?rangeDays=30`);
              return {
                ...linkItem,
                clicksCount: analyticsRes.data.data.totalClicks || 0,
              };
            } catch {
              return {
                ...linkItem,
                clicksCount: 0,
              };
            }
          })
        );

        setLinks(linksWithClicks);
        setTotalPages(res.data.data.meta.totalPages);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch links list';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [page, searchDebounced, sortOption, refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Short URL copied to clipboard!', 'success');
  };

  const getLinkStatus = (linkItem: Link): 'active' | 'inactive' | 'expired' => {
    if (!linkItem.isActive) return 'inactive';
    if (linkItem.expiresAt && new Date(linkItem.expiresAt) < new Date()) return 'expired';
    return 'active';
  };

  const toggleStatus = async (linkItem: Link) => {
    try {
      await api.patch(`/api/links/${linkItem.id}/status`);
      showToast(`Link status ${linkItem.isActive ? 'disabled' : 'enabled'} successfully!`, 'success');
      triggerRefresh();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to toggle status';
      showToast(errMsg, 'error');
    }
  };

  // Perform client-side status filtering
  const filteredLinks = links.filter((linkItem) => {
    const status = getLinkStatus(linkItem);
    if (statusFilter === 'all') return true;
    return status === statusFilter;
  });

  // Perform client-side click count sorting if selected
  const sortedAndFilteredLinks = [...filteredLinks].sort((a, b) => {
    if (sortOption === 'clicks-desc') {
      return (b.clicksCount || 0) - (a.clicksCount || 0);
    }
    if (sortOption === 'clicks-asc') {
      return (a.clicksCount || 0) - (b.clicksCount || 0);
    }
    return 0; // Backend handles sorting for other options
  });

  const columns = [
    {
      header: 'Title & Destination',
      accessor: (row: Link) => (
        <div className="flex flex-col gap-1 max-w-xs md:max-w-md">
          <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
            {row.title || 'Untitled Link'}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate hover:text-indigo-500 dark:hover:text-indigo-400 select-all cursor-pointer">
            {row.originalUrl}
          </span>
        </div>
      ),
    },
    {
      header: 'Short URL',
      accessor: (row: Link) => (
        <div className="flex items-center gap-2">
          <a
            href={row.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-650 dark:text-indigo-400 font-bold hover:underline select-all select-text cursor-pointer"
          >
            {row.shortUrl}
          </a>
          <button
            onClick={() => handleCopy(row.shortUrl)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
            title="Copy URL"
          >
            <Copy size={12} />
          </button>
        </div>
      ),
    },
    {
      header: 'Custom Alias',
      accessor: (row: Link) => (
        <span className="font-semibold text-slate-605 dark:text-slate-400">
          {row.customAlias || '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Link) => {
        const status = getLinkStatus(row);
        if (status === 'active') return <Badge variant="success">Active</Badge>;
        if (status === 'inactive') return <Badge variant="neutral">Disabled</Badge>;
        return <Badge variant="danger">Expired</Badge>;
      },
    },
    {
      header: 'Clicks',
      accessor: (row: Link) => (
        <span className="font-bold text-slate-800 dark:text-slate-250">
          {row.clicksCount !== undefined ? row.clicksCount.toLocaleString() : '...'}
        </span>
      ),
    },
    {
      header: 'Created Date',
      accessor: (row: Link) => (
        <span className="text-slate-500 dark:text-slate-450 font-medium">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Link) => (
        <div className="flex gap-1 items-center">
          {/* Toggle status */}
          <button
            onClick={() => toggleStatus(row)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            title={row.isActive ? 'Disable Link' : 'Enable Link'}
          >
            {row.isActive ? (
              <ToggleRight size={18} className="text-indigo-650 dark:text-indigo-400" />
            ) : (
              <ToggleLeft size={18} className="text-slate-400" />
            )}
          </button>

          {/* Edit */}
          <button
            onClick={() => {
              setSelectedLink(row);
              setIsEditOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            title="Edit Metadata"
          >
            <Edit2 size={13} />
          </button>

          {/* External Original Destination Link */}
          <a
            href={row.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
            title="Open Destination Link"
          >
            <ExternalLink size={13} />
          </a>

          {/* View Analytics */}
          <button
            onClick={() => navigate(`/analytics?linkId=${row.id}`)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            title="View Analytics"
          >
            <BarChart3 size={13} />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              setSelectedLink(row);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
            title="Delete Link"
          >
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

      {/* Filter, Search, and Sort Panel */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
          
          {/* Search bar */}
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-650" />
            <input
              placeholder="Search links by title, code or custom alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 transition-all"
            />
          </div>

          {/* Sorting drop down */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-450 dark:text-slate-500 font-bold whitespace-nowrap">
              Sort By:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-600 dark:text-slate-350 font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Created Date (Newest)</option>
              <option value="oldest">Created Date (Oldest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="clicks-desc">Clicks (Highest)</option>
              <option value="clicks-asc">Clicks (Lowest)</option>
            </select>
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-slate-100 dark:border-slate-800/80" />

        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'inactive', 'expired'] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* error state block */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg mx-auto">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-xl mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Failed to Load Links
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
            {error}. Please check your connection or database server state.
          </p>
          <Button variant="primary" size="sm" onClick={fetchLinks}>
            Retry Request
          </Button>
        </div>
      ) : loading ? (
        /* skeleton loader during fetches */
        <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-md w-1/4 animate-pulse" />
          <hr className="border-slate-100 dark:border-slate-850" />
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center gap-4 py-2">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/6 animate-pulse" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-12 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : sortedAndFilteredLinks.length === 0 ? (
        /* empty state illustration */
        <EmptyState
          title="No links matching filters"
          description={
            searchDebounced
              ? `No link record matches your search query "${searchDebounced}".`
              : 'Add your first link shortener by clicking the button above.'
          }
          icon={<Link2 size={36} className="text-slate-400" />}
          action={
            !searchDebounced ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
              >
                Create First Link
              </Button>
            ) : undefined
          }
        />
      ) : (
        /* render data table */
        <Table columns={columns} data={sortedAndFilteredLinks} />
      )}

      {/* Pagination wrapper */}
      {!loading && !error && sortedAndFilteredLinks.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Reusable Create Link Modal */}
      <CreateLinkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={triggerRefresh}
      />

      {/* Reusable Edit Link Modal */}
      <EditLinkModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedLink(null);
        }}
        onSuccess={triggerRefresh}
        link={selectedLink}
      />

      {/* Reusable Delete Link Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedLink(null);
        }}
        onSuccess={triggerRefresh}
        link={selectedLink}
      />
    </div>
  );
};
export default Links;
