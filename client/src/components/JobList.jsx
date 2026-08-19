import React from 'react';
import JobCard from './JobCard.jsx';
import { ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react';

export default function JobList({ jobs, isLoading, error, pagination, onPageChange }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8 bg-white rounded-2xl border-4 border-slate-900 shadow-[6px_6px_0_0_#0f172a] text-slate-900 text-sm gap-3 font-mono font-bold">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Searching radar for jobs...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 bg-white/70 rounded-2xl border-3 border-slate-900 shadow-[4px_4px_0_0_#0f172a] animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-100 border-4 border-slate-900 rounded-2xl shadow-[6px_6px_0_0_#0f172a] text-rose-900">
        <p className="font-extrabold text-base uppercase font-mono">Unable to load job listings</p>
        <p className="text-xs mt-1 font-medium">{error}</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-12 text-center bg-white border-4 border-slate-900 rounded-2xl shadow-[6px_6px_0_0_#0f172a] text-slate-700">
        <div className="w-16 h-16 bg-yellow-200 border-3 border-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0_0_#0f172a] -rotate-6">
          <Search className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h4 className="font-black text-slate-900 text-base font-mono uppercase">No jobs found on radar!</h4>
        <p className="text-xs font-medium text-slate-600 mt-1">Try tweaking your search term or clearing active filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid of Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <JobCard key={`${job.source}-${job.externalId}`} job={job} />
        ))}
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-slate-900/20 text-xs font-mono font-bold text-slate-800">
          <span>
            Showing <strong className="text-slate-900">{((pagination.page - 1) * pagination.limit) + 1}</strong> to{' '}
            <strong className="text-slate-900">
              {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
            </strong>{' '}
            of <strong className="text-slate-900">{pagination.totalItems}</strong> listings
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white hover:bg-yellow-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Prev</span>
            </button>

            <span className="px-3.5 py-1.5 rounded-xl bg-yellow-200 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a]">
              Page {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white hover:bg-yellow-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
