import React from 'react';
import { Play, RefreshCw, Zap, Sparkles } from 'lucide-react';

export default function IngestionStatusCard({ lastRun, onTriggerIngest, isIngesting, ingestResult }) {
  const displayRun = ingestResult || lastRun;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-300 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a]">SUCCESS ✨</span>;
      case 'PARTIAL_SUCCESS':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-300 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a]">PARTIAL SUCCESS ⚡</span>;
      case 'SUSPICIOUS_EMPTY':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-300 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a]">SUSPICIOUS EMPTY ⚠️</span>;
      case 'FAILED':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-300 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a]">FAILED 💥</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a]">IDLE 💤</span>;
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return 'No runs recorded yet';
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleString();
  };

  return (
    <div className="bg-white border-4 border-slate-900 rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0_0_#0f172a]">
      {/* Header & Run Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-900/20">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight font-mono uppercase">
              Ingestion Control
            </h3>
            {displayRun && getStatusBadge(displayRun.status)}
          </div>
          <p className="text-xs text-slate-600 mt-1 font-mono font-medium">
            Run: #{displayRun?.run_id || displayRun?.runId || 'N/A'} • Started: {formatTime(displayRun?.started_at || displayRun?.startedAt)}
          </p>
        </div>

        {/* Big Cartoon Button */}
        <button
          onClick={onTriggerIngest}
          disabled={isIngesting}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-yellow-300 hover:bg-yellow-400 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_0_#0f172a] font-extrabold text-slate-900 text-sm border-3 border-slate-900 shadow-[4px_4px_0_0_#0f172a] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isIngesting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Hunting for Jobs...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-slate-900 text-slate-900" />
              <span>Run Ingestion Now</span>
            </>
          )}
        </button>
      </div>

      {/* Chunky Metric Cards */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
        <div className="p-3 bg-sky-100 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
          <span className="text-slate-600 font-bold block mb-1 uppercase">Fetched</span>
          <span className="text-xl font-black text-slate-900">{displayRun?.jobs_fetched ?? displayRun?.jobsFetched ?? 0}</span>
        </div>

        <div className="p-3 bg-emerald-100 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
          <span className="text-emerald-800 font-bold block mb-1 uppercase">Inserted</span>
          <span className="text-xl font-black text-emerald-800">+{displayRun?.jobs_inserted ?? displayRun?.jobsInserted ?? 0}</span>
        </div>

        <div className="p-3 bg-purple-100 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
          <span className="text-purple-800 font-bold block mb-1 uppercase">Updated</span>
          <span className="text-xl font-black text-purple-800">{displayRun?.jobs_updated ?? displayRun?.jobsUpdated ?? 0}</span>
        </div>

        <div className="p-3 bg-amber-100 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
          <span className="text-amber-800 font-bold block mb-1 uppercase">Duplicates</span>
          <span className="text-xl font-black text-amber-800">{displayRun?.duplicates_skipped ?? displayRun?.duplicatesSkipped ?? 0}</span>
        </div>

        <div className="p-3 bg-rose-100 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
          <span className="text-rose-800 font-bold block mb-1 uppercase">Invalid</span>
          <span className="text-xl font-black text-rose-800">{displayRun?.invalid_records ?? displayRun?.invalidRecords ?? 0}</span>
        </div>
      </div>

      {(displayRun?.error_message || displayRun?.errorMessage) && (
        <div className="mt-4 p-3 bg-rose-100 border-2 border-slate-900 rounded-xl text-rose-900 text-xs font-mono shadow-[3px_3px_0_0_#0f172a]">
          <strong>Error:</strong> {displayRun.error_message || displayRun.errorMessage}
        </div>
      )}
    </div>
  );
}
