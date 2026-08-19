import React from 'react';
import { History } from 'lucide-react';

export default function IngestionActivityTable({ runs = [] }) {
  const formatTime = (isoStr) => {
    if (!isoStr) return 'N/A';
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-300 border border-slate-900 text-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a]">SUCCESS</span>;
      case 'PARTIAL_SUCCESS':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-sky-300 border border-slate-900 text-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a]">PARTIAL</span>;
      case 'SUSPICIOUS_EMPTY':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-amber-300 border border-slate-900 text-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a]">EMPTY</span>;
      case 'FAILED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-rose-300 border border-slate-900 text-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a]">FAILED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-slate-200 border border-slate-900 text-slate-900">IDLE</span>;
    }
  };

  return (
    <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0_0_#0f172a] hover:shadow-[9px_9px_0_0_#0f172a] hover:-translate-y-0.5 transition-all duration-200 space-y-4">
      <div className="flex items-center justify-between border-b-3 border-slate-900/20 pb-3.5 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-200 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_0_#0f172a] hover:rotate-6 transition-transform">
            <History className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Recent Ingestion Runs</h3>
        </div>
        <span className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-900/30">Showing last {runs.length} runs</span>
      </div>

      {runs.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono font-black text-slate-500">No ingestion runs logged yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-black uppercase bg-slate-100/80">
                <th className="py-3 px-3.5 rounded-l-xl">Run ID</th>
                <th className="py-3 px-3.5">Time</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Fetched</th>
                <th className="py-3 px-3.5 text-right">Inserted</th>
                <th className="py-3 px-3.5 text-right">Updated</th>
                <th className="py-3 px-3.5 text-right">Skipped</th>
                <th className="py-3 px-3.5 text-right rounded-r-xl">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 text-slate-800 font-bold">
              {runs.map((run) => (
                <tr key={run.id || run.run_id} className="hover:bg-yellow-100/80 transition-colors">
                  <td className="py-3 px-3.5 font-black text-slate-900 truncate max-w-[120px]" title={run.run_id}>
                    #{run.run_id ? run.run_id.split('_').pop() : run.id}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 font-extrabold">{formatTime(run.started_at)}</td>
                  <td className="py-3 px-3.5">{getStatusBadge(run.status)}</td>
                  <td className="py-3 px-3.5 text-right font-black">{run.jobs_fetched}</td>
                  <td className="py-3 px-3.5 text-right font-black text-emerald-700">+{run.jobs_inserted}</td>
                  <td className="py-3 px-3.5 text-right font-black text-purple-700">{run.jobs_updated}</td>
                  <td className="py-3 px-3.5 text-right text-amber-700 font-black">{run.duplicates_skipped}</td>
                  <td className="py-3 px-3.5 text-right text-slate-600 font-bold">{run.duration_ms ? `${run.duration_ms}ms` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
