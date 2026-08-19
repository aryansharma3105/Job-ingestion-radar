import React from 'react';
import { Server, AlertTriangle, Radio, Activity } from 'lucide-react';

export default function SourceHealthCard({ sourceHealth, lastRun }) {
  if (!sourceHealth) return null;

  const isDegraded = sourceHealth.state === 'DEGRADED';
  const badgeColor = isDegraded ? 'bg-amber-300' : 'bg-emerald-300';

  const formatTime = (isoStr) => {
    if (!isoStr) return 'Never';
    const date = new Date(isoStr);
    return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0_0_#0f172a] hover:shadow-[9px_9px_0_0_#0f172a] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b-3 border-slate-900/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-200 border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-[2px_2px_0_0_#0f172a] hover:rotate-6 transition-transform">
              <Radio className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-slate-900 text-base uppercase font-mono tracking-tight">Source Radar</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] hover:rotate-3 transition-transform ${badgeColor}`}>
            {isDegraded ? 'DEGRADED ⚠️' : 'ACTIVE 📡'}
          </span>
        </div>

        <div className="mt-4 space-y-2.5 text-xs font-mono">
          <div className="p-3 bg-slate-50 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_0_#0f172a] hover:bg-yellow-50 transition-colors">
            <span className="text-slate-500 font-extrabold block text-[10px] uppercase tracking-wider">Target Endpoint</span>
            <span className="font-black text-slate-900 truncate block mt-0.5" title={sourceHealth.source}>
              {sourceHealth.source}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_0_#0f172a] hover:bg-yellow-50 transition-colors">
              <span className="text-slate-500 font-extrabold block text-[10px] uppercase tracking-wider">Last Ping</span>
              <span className="font-black text-slate-900 block mt-0.5">
                {formatTime(sourceHealth.lastRequestTime)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border-2 border-slate-900 rounded-xl shadow-[2px_2px_0_0_#0f172a] hover:bg-yellow-50 transition-colors">
              <span className="text-slate-500 font-extrabold block text-[10px] uppercase tracking-wider">Latency</span>
              <span className="font-black text-slate-900 block mt-0.5">
                {lastRun?.duration_ms ? `${lastRun.duration_ms}ms` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isDegraded && (
        <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-100 border-2 border-slate-900 text-slate-900 text-xs font-mono shadow-[2.5px_2.5px_0_0_#0f172a] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-black block uppercase tracking-wide">Outage Alert</span>
            <p className="text-slate-700 text-[11px] mt-0.5 font-bold">{sourceHealth.message || 'Serving stored jobs cache.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
