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
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-200 border border-slate-900 text-slate-900 shadow-[1px_1px_0_0_#0f172a]">SUCCESS</span>;
      case 'PARTIAL_SUCCESS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-sky-200 border border-slate-900 text-slate-900 shadow-[1px_1px_0_0_#0f172a]">PARTIAL</span>;
      case 'SUSPICIOUS_EMPTY':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-200 border border-slate-900 text-slate-900 shadow-[1px_1px_0_0_#0f172a]">EMPTY</span>;
      case 'FAILED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-rose-200 border border-slate-900 text-slate-900 shadow-[1px_1px_0_0_#0f172a]">FAILED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-slate-200 border border-slate-900 text-slate-900">IDLE</span>;
    }
  };

  return (
    <div className="bg-white border-4 border-slate-900 rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0_0_#0f172a] space-y-4">
      <div className="flex items-center justify-between border-b-2 border-slate-900/20 pb-3 font-mono">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-200 border-2 border-slate-900 rounded-lg shadow-[1.5px_1.5px_0_0_#0f172a]">
            <History className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-sm uppercase">Recent Ingestion Runs</h3>
        </div>
        <span className="text-xs font-bold text-slate-600">Showing last {runs.length} runs</span>
      </div>

      {runs.length === 0 ? (
        <div className="py-6 text-center text-xs font-mono font-bold text-slate-500">No ingestion runs logged yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-extrabold uppercase bg-slate-50">
                <th className="py-2.5 px-3">Run ID</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Fetched</th>
                <th className="py-2.5 px-3 text-right">Inserted</th>
                <th className="py-2.5 px-3 text-right">Updated</th>
                <th className="py-2.5 px-3 text-right">Skipped</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b border-slate-900/20 text-slate-800 font-bold">
              {runs.map((run) => (
                <tr key={run.id || run.run_id} className="hover:bg-yellow-50 transition">
                  <td className="py-2.5 px-3 font-black text-slate-900 truncate max-w-[120px]" title={run.run_id}>
                    #{run.run_id ? run.run_id.split('_').pop() : run.id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{formatTime(run.started_at)}</td>
                  <td className="py-2.5 px-3">{getStatusBadge(run.status)}</td>
                  <td className="py-2.5 px-3 text-right font-black">{run.jobs_fetched}</td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-700">+{run.jobs_inserted}</td>
                  <td className="py-2.5 px-3 text-right font-black text-purple-700">{run.jobs_updated}</td>
                  <td className="py-2.5 px-3 text-right text-amber-700">{run.duplicates_skipped}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{run.duration_ms ? `${run.duration_ms}ms` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
