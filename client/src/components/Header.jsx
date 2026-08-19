import React from 'react';
import { Search, Database, Radio, RefreshCw } from 'lucide-react';

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
            title={logoClicks > 0 ? `${5 - logoClicks} more clicks for a secret...` : 'Job Radar Logo (Click me!)'}
            className="w-12 h-12 bg-yellow-300 border-3 border-slate-900 rounded-2xl flex items-center justify-center text-slate-900 shadow-[3.5px_3.5px_0_0_#0f172a] transform -rotate-3 hover:rotate-6 hover:scale-110 hover:shadow-[5px_5px_0_0_#0f172a] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_0_#0f172a] transition-all duration-150 cursor-pointer select-none"
          >
            <Search className="w-6 h-6 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono uppercase select-none">
                Job Ingestion Radar
              </h1>
              <span className="bg-pink-400 text-white text-[10px] font-black px-2 py-0.5 rounded-md border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] -rotate-2 hover:rotate-3 transition-transform">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-600 font-extrabold tracking-wide">Real-time Data Pipeline & Job Discovery Platform</p>
          </div>
        </div>

        {/* Badges and Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-black font-mono">
          {/* Source Sticker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-200 border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] transition-all duration-150">
            <Radio className="w-3.5 h-3.5 text-slate-900 animate-pulse" />
            <span className="text-slate-700">SOURCE:</span>
            <span className="uppercase">{sourceName}</span>
          </div>

          {/* Database Counter Sticker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-200 border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] transition-all duration-150">
            <Database className="w-3.5 h-3.5" />
            <span className="text-slate-700">STORED:</span>
            <span className="bg-white px-2 py-0.5 rounded-md border border-slate-900 text-slate-900 font-extrabold">{totalJobs.toLocaleString()}</span>
          </div>

          {/* Health Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] transition-all duration-150 ${
            isHealthy ? 'bg-emerald-300' : 'bg-amber-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full border border-slate-900 ${isHealthy ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`}></span>
            <span>{isHealthy ? 'OPERATIONAL' : 'DEGRADED'}</span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white hover:bg-yellow-300 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_0_#0f172a] border-2 border-slate-900 text-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] transition-all duration-150 disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
