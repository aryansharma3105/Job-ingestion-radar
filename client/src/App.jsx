import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import SourceHealthCard from './components/SourceHealthCard.jsx';
import IngestionStatusCard from './components/IngestionStatusCard.jsx';
import StaleDataBanner from './components/StaleDataBanner.jsx';
import JobSearchFilters from './components/JobSearchFilters.jsx';
import JobList from './components/JobList.jsx';
import IngestionActivityTable from './components/IngestionActivityTable.jsx';
import { fetchJobs, triggerIngestion, fetchIngestionStatus, fetchHealth } from './services/api.js';

export default function App() {
  // State for jobs listing and filters
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalItems: 0, totalPages: 1 });
  const [filtersOptions, setFiltersOptions] = useState({ categories: [], jobTypes: [] });

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);

  // Status & Health State
  const [statusData, setStatusData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [ingestResult, setIngestResult] = useState(null);

  // Loading & Action States
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [ingestNotification, setIngestNotification] = useState(null);

  // Load Status and Health metrics
  const loadStatusAndHealth = useCallback(async () => {
    try {
      const [statusRes, healthRes] = await Promise.all([
        fetchIngestionStatus().catch(() => null),
        fetchHealth().catch(() => null)
      ]);

      if (statusRes?.success) {
        setStatusData(statusRes.data);
      }
      if (healthRes) {
        setHealthData(healthRes);
      }
    } catch (err) {
      console.error('Failed to load status/health:', err);
    }
  }, []);

  // Load Jobs Listing
  const loadJobsList = useCallback(async () => {
    setIsLoadingJobs(true);
    setErrorMsg(null);
    try {
      const res = await fetchJobs({ page, limit: 20, search, location, category, jobType });
      if (res.success) {
        setJobs(res.data.jobs);
        setPagination(res.data.pagination);
        setFiltersOptions(res.data.filters);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setErrorMsg(err.message || 'Unable to connect to server backend.');
    } finally {
      setIsLoadingJobs(false);
    }
  }, [page, search, location, category, jobType]);

  // Combined Refresh
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadStatusAndHealth(), loadJobsList()]);
    setIsRefreshing(false);
  };

  // Initial Load & Polling setup
  useEffect(() => {
    loadStatusAndHealth();
    loadJobsList();

    // Auto refresh status every 30 seconds
    const interval = setInterval(() => {
      loadStatusAndHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadStatusAndHealth, loadJobsList]);

  // Trigger Manual Ingestion
  const handleRunIngestion = async () => {
    setIsIngesting(true);
    setIngestNotification(null);
    try {
      const result = await triggerIngestion();
      if (result.success) {
        setIngestResult(result.data);
        setIngestNotification({
          type: 'success',
          text: `🎉 Ingestion Complete! Fetched: ${result.data.jobsFetched}, Inserted: +${result.data.jobsInserted}, Updated: ${result.data.jobsUpdated}, Skipped: ${result.data.duplicatesSkipped}`
        });

        // Immediately refresh jobs listing & system metrics
        await Promise.all([loadStatusAndHealth(), loadJobsList()]);
      }
    } catch (err) {
      setIngestNotification({
        type: 'error',
        text: `💥 Ingestion Failed: ${err.message}`
      });
      await loadStatusAndHealth();
    } finally {
      setIsIngesting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('');
    setJobType('');
    setPage(1);
  };

  const isDegraded = statusData?.sourceHealth?.state === 'DEGRADED';

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Header */}
      <Header
        statusData={statusData}
        healthData={healthData}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Notification Toast */}
        {ingestNotification && (
          <div className={`p-4 rounded-2xl text-sm border-3 border-slate-900 font-extrabold flex items-center justify-between shadow-[4px_4px_0_0_#0f172a] transition ${
            ingestNotification.type === 'success'
              ? 'bg-emerald-200 text-slate-900'
              : 'bg-rose-200 text-slate-900'
          }`}>
            <span>{ingestNotification.text}</span>
            <button
              onClick={() => setIngestNotification(null)}
              className="text-xs px-2.5 py-1 bg-white border-2 border-slate-900 rounded-lg shadow-[1.5px_1.5px_0_0_#0f172a] hover:bg-yellow-200 ml-4 font-mono uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stale Data Outage Warning Banner */}
        <StaleDataBanner
          isDegraded={isDegraded}
          lastSuccessfulIngestionAt={statusData?.lastSuccessfulIngestionAt}
          sourceUrl={statusData?.sourceUrl || 'https://remotive.com/api/remote-jobs'}
        />

        {/* Dashboard Control Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IngestionStatusCard
              lastRun={statusData?.lastRun}
              onTriggerIngest={handleRunIngestion}
              isIngesting={isIngesting}
              ingestResult={ingestResult}
            />
          </div>
          <div>
            <SourceHealthCard
              sourceHealth={statusData?.sourceHealth}
              lastRun={statusData?.lastRun}
            />
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <JobSearchFilters
          search={search}
          setSearch={(v) => { setSearch(v); setPage(1); }}
          location={location}
          setLocation={(v) => { setLocation(v); setPage(1); }}
          category={category}
          setCategory={(v) => { setCategory(v); setPage(1); }}
          jobType={jobType}
          setJobType={(v) => { setJobType(v); setPage(1); }}
          categories={filtersOptions.categories}
          jobTypes={filtersOptions.jobTypes}
          onReset={handleResetFilters}
        />

        {/* Job Listings Grid */}
        <JobList
          jobs={jobs}
          isLoading={isLoadingJobs}
          error={errorMsg}
          pagination={pagination}
          onPageChange={(newPage) => setPage(newPage)}
        />

        {/* Recent Ingestion History Logs Table */}
        <IngestionActivityTable runs={statusData?.recentRuns || []} />
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-slate-900 bg-white/95 backdrop-blur py-6 text-center text-xs text-slate-700 font-mono font-bold shadow-[0_-4px_0_0_#0f172a]">
        Job Ingestion Radar • Automated Real-time Job Ingestion & Discovery Platform
      </footer>
    </div>
  );
}
