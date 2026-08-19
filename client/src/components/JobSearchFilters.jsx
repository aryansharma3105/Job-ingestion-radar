import React from 'react';
import { Search, Filter, MapPin, Tag, Briefcase, X } from 'lucide-react';

export default function JobSearchFilters({
  search,
  setSearch,
  location,
  setLocation,
  category,
  setCategory,
  jobType,
  setJobType,
  categories = [],
  jobTypes = [],
  onReset
}) {
  const hasActiveFilters = Boolean(search || location || category || jobType);

  return (
    <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0_0_#0f172a] hover:shadow-[9px_9px_0_0_#0f172a] hover:-translate-y-0.5 transition-all duration-200 space-y-4">
      <div className="flex items-center justify-between text-xs font-black text-slate-900 pb-3 border-b-3 border-slate-900/20 font-mono uppercase">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-300 border-2 border-slate-900 rounded-xl shadow-[1.5px_1.5px_0_0_#0f172a] hover:rotate-6 transition-transform">
            <Filter className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-sm tracking-tight">Filter & Search Jobs</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-200 border-2 border-slate-900 text-slate-900 hover:bg-rose-300 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#0f172a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0_0_#0f172a] transition-all font-black text-[11px]"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs font-medium">
        {/* Search Input */}
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-700 absolute left-3.5 top-3.5 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="Search title, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl pl-10 pr-3 py-3 text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#0f172a] transition-all"
          />
        </div>

        {/* Location Input */}
        <div className="relative group">
          <MapPin className="w-4 h-4 text-slate-700 absolute left-3.5 top-3.5 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="Filter location (e.g. USA)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl pl-10 pr-3 py-3 text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#0f172a] transition-all"
          />
        </div>

        {/* Category Select */}
        <div className="relative group">
          <Tag className="w-4 h-4 text-slate-700 absolute left-3.5 top-3.5 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl pl-10 pr-3 py-3 text-slate-900 font-extrabold focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#0f172a] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Job Type Select */}
        <div className="relative group">
          <Briefcase className="w-4 h-4 text-slate-700 absolute left-3.5 top-3.5 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl pl-10 pr-3 py-3 text-slate-900 font-extrabold focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_0_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#0f172a] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Job Types</option>
            {jobTypes.map((jt) => (
              <option key={jt} value={jt}>
                {jt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
