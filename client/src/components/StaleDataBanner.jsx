import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

export default function StaleDataBanner({ isDegraded, lastSuccessfulIngestionAt, sourceUrl }) {
  if (!isDegraded) return null;

  const formatTime = (isoStr) => {
    if (!isoStr) return 'No previous run date';
    const date = new Date(isoStr);
    return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
  };

  return (
    <div className="bg-amber-200 border-4 border-slate-900 rounded-2xl p-4 text-slate-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[6px_6px_0_0_#0f172a]">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-400 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_0_#0f172a]">
          <ShieldAlert className="w-5 h-5 text-slate-900 shrink-0" />
        </div>
        <div>
          <h4 className="font-black text-slate-900 text-sm uppercase font-mono">
            Source unavailable — displaying previously stored jobs.
          </h4>
          <p className="text-xs text-slate-800 font-medium mt-0.5">
            The external endpoint ({sourceUrl}) is temporarily unreachable. The pipeline has degraded gracefully to serve cached data.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-slate-900 font-mono text-xs text-slate-900 font-bold shadow-[2px_2px_0_0_#0f172a] shrink-0">
        <Clock className="w-3.5 h-3.5 text-slate-900" />
        <span>Last Success: {formatTime(lastSuccessfulIngestionAt)}</span>
      </div>
    </div>
  );
}
