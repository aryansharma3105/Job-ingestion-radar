import React from 'react';
import { Play, RefreshCw, Zap, Sparkles } from 'lucide-react';

export default function IngestionStatusCard({ lastRun, onTriggerIngest, isIngesting, ingestResult }) {
  const displayRun = ingestResult || lastRun;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-300 border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] hover:rotate-2 transition-transform">SUCCESS ✨</span>;
      case 'PARTIAL_SUCCESS':
        return <span className="px-3.5 py-1 rounded-full text-xs font-black bg-sky-300 border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] hover:rotate-2 transition-transform">PARTIAL SUCCESS ⚡</span>;
      case 'SUSPICIOUS_EMPTY':
        return <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-300 border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] hover:rotate-2 transition-transform">SUSPICIOUS EMPTY ⚠️</span>;
      case 'FAILED':
        return <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-300 border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] hover:rotate-2 transition-transform">FAILED 💥</span>;
      default:
        return <span className="px-3.5 py-1 rounded-full text-xs font-black bg-slate-200 border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a]">IDLE 💤</span>;
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return 'No runs recorded yet';
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleString();
  };

  return (
    <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0_0_#0f172a] hover:shadow-[9px_9px_0_0_#0f172a] hover:-translate-y-0.5 transition-all duration-200">
      {/* Header & Run Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-3 border-slate-900/20">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight font-mono uppercase">
              Ingestion Control
            </h3>
            {displayRun && getStatusBadge(displayRun.status)}
          </div>
          <p className="text-xs text-slate-600 mt-1 font-mono font-bold">
            Run: #{displayRun?.run_id || displayRun?.runId || 'N/A'} • Started: {formatTime(displayRun?.started_at || displayRun?.startedAt)}
          </p>
        </div>

        {/* Big Tactile Cartoon Button */}
        <button
          onClick={onTriggerIngest}
          disabled={isIngesting}
          className="group flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-yellow-300 hover:bg-yellow-400 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0f172a] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_0_#0f172a] font-black text-slate-900 text-sm border-3 border-slate-900 shadow-[4px_4px_0_0_#0f172a] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-mono uppercase"
        >
          {isIngesting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Hunting for Jobs...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-slate-900 text-slate-900 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <span>Run Ingestion Now</span>
            </>
          )}
        </button>
      </div>

      {/* Chunky Metric Cards with Hover Effects */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
        <div className="p-3.5 bg-sky-100 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:rotate-1 hover:shadow-[5px_5px_0_0_#0f172a] transition-all duration-150">
          <span className="text-slate-600 font-extrabold block mb-1 uppercase tracking-wider text-[11px]">Fetched</span>
          <span className="text-2xl font-black text-slate-900">{displayRun?.jobs_fetched ?? displayRun?.jobsFetched ?? 0}</span>
        </div>

        <div className="p-3.5 bg-emerald-100 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:-rotate-1 hover:shadow-[5px_5px_0_0_#0f172a] transition-all duration-150">
          <span className="text-emerald-800 font-extrabold block mb-1 uppercase tracking-wider text-[11px]">Inserted</span>
          <span className="text-2xl font-black text-emerald-800">+{displayRun?.jobs_inserted ?? displayRun?.jobsInserted ?? 0}</span>
        </div>

        <div className="p-3.5 bg-purple-100 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:rotate-1 hover:shadow-[5px_5px_0_0_#0f172a] transition-all duration-150">
          <span className="text-purple-800 font-extrabold block mb-1 uppercase tracking-wider text-[11px]">Updated</span>
          <span className="text-2xl font-black text-purple-800">{displayRun?.jobs_updated ?? displayRun?.jobsUpdated ?? 0}</span>
        </div>

        <div className="p-3.5 bg-amber-100 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:-rotate-1 hover:shadow-[5px_5px_0_0_#0f172a] transition-all duration-150">
          <span className="text-amber-800 font-extrabold block mb-1 uppercase tracking-wider text-[11px]">Duplicates</span>
          <span className="text-2xl font-black text-amber-800">{displayRun?.duplicates_skipped ?? displayRun?.duplicatesSkipped ?? 0}</span>
        </div>

        <div className="p-3.5 bg-rose-100 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-1 hover:rotate-1 hover:shadow-[5px_5px_0_0_#0f172a] transition-all duration-150">
          <span className="text-rose-800 font-extrabold block mb-1 uppercase tracking-wider text-[11px]">Invalid</span>
          <span className="text-2xl font-black text-rose-800">{displayRun?.invalid_records ?? displayRun?.invalidRecords ?? 0}</span>
        </div>
      </div>

      {(displayRun?.error_message || displayRun?.errorMessage) && (
        <div className="mt-4 p-3.5 bg-rose-100 border-2 border-slate-900 rounded-2xl text-rose-900 text-xs font-mono shadow-[3px_3px_0_0_#0f172a]">
          <strong>Error:</strong> {displayRun.error_message || displayRun.errorMessage}
        </div>
      )}
    </div>
  );
}
