import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Globe2,
  RefreshCw,
  Smartphone,
  MousePointerClick,
  Link2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

import { Button } from '@ui/Button.js';
import { Card } from '@ui/Card.js';
import { EmptyState } from '@ui/EmptyState.js';
import { Badge } from '@ui/Badge.js';
import { api } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.js';
import { Link, DashboardStats } from '../types/index.js';

interface ChartDataPoint {
  date: string;
  count: number;
}

interface StatItem {
  name: string | null;
  count: number;
  percentage: number;
}

interface LinkAnalyticsData {
  totalClicks: number;
  timeline: ChartDataPoint[];
  browsers: StatItem[];
  countries: StatItem[];
  referrers: StatItem[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Analytics: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryLinkId = searchParams.get('linkId') || '';

  // Dropdown list state
  const [linksList, setLinksList] = useState<Link[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string>(queryLinkId);

  // Dashboard Overview state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Selected Link details & analytics state
  const [selectedLinkMeta, setSelectedLinkMeta] = useState<Link | null>(null);
  const [analyticsData, setAnalyticsData] = useState<LinkAnalyticsData | null>(null);
  
  // Controls
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync selectedLinkId with query parameter
  useEffect(() => {
    setSelectedLinkId(queryLinkId);
  }, [queryLinkId]);

  // Fetch dropdown list of links
  useEffect(() => {
    const fetchLinksList = async () => {
      try {
        const res = await api.get('/api/links?limit=100');
        if (res.data?.success) {
          setLinksList(res.data.data.data);
        }
      } catch (err: any) {
        console.error('Failed to load links list:', err.message);
      }
    };
    fetchLinksList();
  }, [refreshKey]);

  // Fetch metrics based on selected view (Dashboard overview vs Specific Link details)
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!selectedLinkId) {
          // Fetch global dashboard summary stats
          const res = await api.get('/api/analytics/dashboard');
          if (res.data?.success) {
            setDashboardStats(res.data.data);
          }
          setAnalyticsData(null);
          setSelectedLinkMeta(null);
        } else {
          // Fetch link metadata details
          try {
            const metaRes = await api.get(`/api/links/${selectedLinkId}`);
            if (metaRes.data?.success) {
              setSelectedLinkMeta(metaRes.data.data);
            }
          } catch {
            setSelectedLinkMeta(null);
          }

          // Fetch specific link details
          const [analyticsRes, browsersRes, countriesRes, referrersRes] = await Promise.all([
            api.get(`/api/analytics/${selectedLinkId}?rangeDays=${rangeDays}`),
            api.get(`/api/analytics/${selectedLinkId}/browsers?rangeDays=${rangeDays}`),
            api.get(`/api/analytics/${selectedLinkId}/countries?rangeDays=${rangeDays}`),
            api.get(`/api/analytics/${selectedLinkId}/referrers?rangeDays=${rangeDays}`),
          ]);

          if (analyticsRes.data?.success) {
            const baseData = analyticsRes.data.data;
            setAnalyticsData({
              totalClicks: baseData.totalClicks || 0,
              timeline: baseData.timeline || [],
              browsers: browsersRes.data?.data || [],
              countries: countriesRes.data?.data || [],
              referrers: referrersRes.data?.data || [],
            });
          }
          setDashboardStats(null);
        }
      } catch (err: any) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to fetch analytics metrics';
        setError(errMsg);
        showToast(errMsg, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, [selectedLinkId, rangeDays, refreshKey]);

  const handleLinkChange = (id: string) => {
    if (id) {
      setSearchParams({ linkId: id });
    } else {
      setSearchParams({});
    }
  };

  const getLinkStatus = (linkItem: Link): 'active' | 'inactive' | 'expired' => {
    if (!linkItem.isActive) return 'inactive';
    if (linkItem.expiresAt && new Date(linkItem.expiresAt) < new Date()) return 'expired';
    return 'active';
  };

  // Safe percentage helper
  const getPercentage = (value: number, total: number) => {
    if (!total) return '0.0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Analytics Dashboard
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {selectedLinkId
              ? `Real-time telemetry reports for "${selectedLinkMeta?.title || selectedLinkId}"`
              : 'System-wide analytics overview, click distributions, and link health indicator counts.'}
          </p>
        </div>

        {/* Dropdown filter selector */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedLinkId}
            onChange={(e) => handleLinkChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500 max-w-xs transition-all"
          >
            <option value="">Global Dashboard Overview</option>
            {linksList.map((link) => (
              <option key={link.id} value={link.id}>
                🔗 {link.title || link.shortCode} ({link.shortCode})
              </option>
            ))}
          </select>

          {selectedLinkId && (
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value) as 7 | 30 | 90)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-800"
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Sync
          </Button>
        </div>
      </div>

      {/* Selected link metadata detail header */}
      {selectedLinkId && selectedLinkMeta && (
        <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-500/5 to-indigo-600/5 border border-indigo-500/10 rounded-2xl">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {selectedLinkMeta.title || 'Untitled Link'}
              </span>
              {(() => {
                const status = getLinkStatus(selectedLinkMeta);
                if (status === 'active') return <Badge variant="success">Active</Badge>;
                if (status === 'inactive') return <Badge variant="neutral">Disabled</Badge>;
                return <Badge variant="danger">Expired</Badge>;
              })()}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-indigo-650 dark:text-indigo-400 select-all">
                  {selectedLinkMeta.shortUrl}
                </span>
                <ChevronRight size={12} className="text-slate-400" />
                <a
                  href={selectedLinkMeta.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 select-all truncate max-w-sm md:max-w-md flex items-center gap-1 font-medium transition-colors"
                >
                  {selectedLinkMeta.originalUrl}
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
          {selectedLinkMeta.expiresAt && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock size={14} />
              <span>
                Expires: {new Date(selectedLinkMeta.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Errors container */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg mx-auto">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-xl mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Failed to Load Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
            {error}. Ensure your PostgreSQL and Redis Docker containers are active.
          </p>
          <Button variant="primary" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)}>
            Retry Report Request
          </Button>
        </div>
      ) : loading ? (
        /* Loading skeleton placeholders */
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="flex flex-col gap-2 p-5 animate-pulse">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
              </Card>
            ))}
          </div>
          <Card className="p-6 h-80 animate-pulse bg-white dark:bg-slate-900">
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/5 mb-6" />
            <div className="h-56 bg-slate-50 dark:bg-slate-950/50 rounded w-full" />
          </Card>
        </div>
      ) : (
        /* Dashboard Render View */
        <div className="flex flex-col gap-6">
          {/* KPI metrics cards grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {selectedLinkId && analyticsData ? (
              /* Link Selected stats cards */
              <>
                <Card className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 rounded-xl">
                    <MousePointerClick size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Total Click Events
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {analyticsData.totalClicks.toLocaleString()}
                    </h3>
                  </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Average Daily Velocity
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {(analyticsData.totalClicks / rangeDays).toFixed(1)}
                    </h3>
                  </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl">
                    <Clock size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Tracking Scope
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {rangeDays} Days
                    </h3>
                  </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl">
                    <Globe2 size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Distinct Countries
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {analyticsData.countries.length}
                    </h3>
                  </div>
                </Card>
              </>
            ) : dashboardStats ? (
              /* Global dashboard stats cards */
              <>
                <Card className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 rounded-xl">
                    <Link2 size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Total Link Items
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {dashboardStats.links.total}
                    </h3>
                  </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl">
                    <Link2 size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Active Links
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {dashboardStats.links.active}
                    </h3>
                  </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl">
                    <MousePointerClick size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Total Click Counts
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {dashboardStats.clicks.total.toLocaleString()}
                    </h3>
                  </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Aggregate CTR
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {dashboardStats.links.total > 0
                        ? `${((dashboardStats.clicks.total / dashboardStats.links.total) * 10).toFixed(1)}%`
                        : '0.0%'}
                    </h3>
                  </div>
                </Card>
              </>
            ) : null}
          </div>

          {/* Detailed charts rendering */}
          {selectedLinkId && analyticsData ? (
            <div className="flex flex-col gap-6">
              {/* Clicks timeline line chart */}
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">
                  Clicks Timeline Chart
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.timeline}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                      <XAxis
                        dataKey="date"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        stroke="#94a3b8"
                      />
                      <YAxis
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        stroke="#94a3b8"
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#090d16',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 1 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Geographic and Browser distributions grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Countries Bar Chart */}
                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
                    <Globe2 size={14} className="text-indigo-500" />
                    Geographic click locations
                  </h4>
                  {analyticsData.countries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <HelpCircle size={24} className="mb-2" />
                      <span className="text-xs">No country telemetry logs found.</span>
                    </div>
                  ) : (
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.countries}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                          <XAxis
                            dataKey="name"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            stroke="#94a3b8"
                          />
                          <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                            stroke="#94a3b8"
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#090d16',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '11px',
                            }}
                          />
                          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>

                {/* Browser Pie Chart */}
                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone size={14} className="text-emerald-500" />
                    Browser Distribution
                  </h4>
                  {analyticsData.browsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <HelpCircle size={24} className="mb-2" />
                      <span className="text-xs">No browser telemetry logs found.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="h-52 w-52 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.browsers}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={3}
                            >
                              {analyticsData.browsers.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: '#090d16',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '11px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Pie chart legends */}
                      <div className="flex flex-col gap-3 w-full">
                        {analyticsData.browsers.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-slate-800 dark:text-slate-250">
                                {item.name || 'Unknown'}
                              </span>
                            </div>
                            <span className="text-slate-400 font-bold">
                              {item.count} ({getPercentage(item.count, analyticsData.totalClicks)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Referrers details layout */}
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={14} className="text-amber-500" />
                  Top Referrers
                </h4>
                {analyticsData.referrers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <HelpCircle size={24} className="mb-2" />
                    <span className="text-xs">No referrer stats logged.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {analyticsData.referrers.map((referrer, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-700 dark:text-slate-300">
                            {referrer.name || 'Direct / Bookmark'}
                          </span>
                          <span className="text-slate-500">
                            {referrer.count.toLocaleString()} clicks ({getPercentage(referrer.count, analyticsData.totalClicks)})
                          </span>
                        </div>
                        <div className="w-full bg-slate-50 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                          <div
                            className="bg-indigo-650 h-full rounded-full"
                            style={{ width: getPercentage(referrer.count, analyticsData.totalClicks) }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            /* Global dashboard overview notice */
            <EmptyState
              title="Detailed telemetry is scope-specific"
              description="To view timeline click charts, browsers distributions, geo-location charts, and referrers details, please select a specific shortened link from the dropdown above."
              icon={<Link2 size={36} className="text-indigo-500" />}
            />
          )}
        </div>
      )}
    </div>
  );
};
export default Analytics;
