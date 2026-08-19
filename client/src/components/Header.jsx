import React from 'react';
import { Search, Database, Radio, RefreshCw, Sparkles } from 'lucide-react';

export default function Header({ statusData, healthData, onRefresh, isRefreshing, onLogoClick, logoClicks }) {
  const isHealthy = healthData?.status === 'healthy';
  const totalJobs = statusData?.totalStoredJobs ?? healthData?.metrics?.totalJobsStored ?? 0;
  const sourceName = statusData?.sourceName || 'Remotive API';

  return (
    <header className="border-b-4 border-slate-900 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-[0_4px_0_0_#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Cartoon Logo (Clickable Easter Egg) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogoClick}
            title={logoClicks > 0 ? `${5 - logoClicks} more clicks for a secret...` : 'Job Radar Logo'}
            className="w-11 h-11 bg-yellow-300 border-2 border-slate-900 rounded-xl flex items-center justify-center text-slate-900 shadow-[3px_3px_0_0_#0f172a] transform -rotate-3 hover:rotate-6 hover:scale-110 active:scale-95 transition cursor-pointer select-none"
          >
            <Search className="w-6 h-6 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-mono uppercase select-none">
                Job Ingestion Radar
              </h1>
              <span className="bg-pink-400 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a] -rotate-2">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-600 font-bold">Real-time Data Pipeline & Job Discovery Platform</p>
          </div>
        </div>

        {/* Badges and Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold font-mono">
          {/* Source Sticker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-200 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a]">
            <Radio className="w-3.5 h-3.5 text-slate-900 animate-pulse" />
            <span className="text-slate-700">SOURCE:</span>
            <span className="uppercase">{sourceName}</span>
          </div>

          {/* Database Counter Sticker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-200 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a]">
            <Database className="w-3.5 h-3.5" />
            <span className="text-slate-700">STORED:</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-900 text-slate-900">{totalJobs.toLocaleString()}</span>
          </div>

          {/* Health Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a] ${
            isHealthy ? 'bg-emerald-300' : 'bg-amber-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full border border-slate-900 ${isHealthy ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`}></span>
            <span>{isHealthy ? 'OPERATIONAL' : 'DEGRADED'}</span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white hover:bg-yellow-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0_0_#0f172a] transition disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
