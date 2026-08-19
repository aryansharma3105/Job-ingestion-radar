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
    <div className="bg-white border-4 border-slate-900 rounded-2xl p-5 shadow-[6px_6px_0_0_#0f172a] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-200 border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-[2px_2px_0_0_#0f172a]">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm uppercase font-mono">Source Radar</h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-black border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] ${badgeColor}`}>
            {isDegraded ? 'DEGRADED ⚠️' : 'ACTIVE 📡'}
          </span>
        </div>

        <div className="mt-4 space-y-2.5 text-xs font-mono">
          <div className="p-2.5 bg-slate-50 border border-slate-900 rounded-lg">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Target Endpoint</span>
            <span className="font-bold text-slate-900 truncate block mt-0.5" title={sourceHealth.source}>
              {sourceHealth.source}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-slate-50 border border-slate-900 rounded-lg">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Last Ping</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {formatTime(sourceHealth.lastRequestTime)}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-900 rounded-lg">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Latency</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {lastRun?.duration_ms ? `${lastRun.duration_ms}ms` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isDegraded && (
        <div className="mt-3 p-3 rounded-xl bg-amber-100 border-2 border-slate-900 text-slate-900 text-xs font-mono shadow-[2px_2px_0_0_#0f172a] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-black block uppercase">Outage Alert</span>
            <p className="text-slate-700 text-[11px] mt-0.5">{sourceHealth.message || 'Serving stored jobs cache.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
