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
    <div className="bg-white border-4 border-slate-900 rounded-2xl p-5 shadow-[6px_6px_0_0_#0f172a] space-y-3.5">
      <div className="flex items-center justify-between text-xs font-extrabold text-slate-900 pb-2.5 border-b-2 border-slate-900/20 font-mono uppercase">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-yellow-300 border border-slate-900 rounded shadow-[1px_1px_0_0_#0f172a]">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm">Filter & Search Jobs</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-200 border-2 border-slate-900 text-slate-900 hover:bg-rose-300 shadow-[2px_2px_0_0_#0f172a] transition font-bold"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-medium">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-700 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search title, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_0_#0f172a] transition"
          />
        </div>

        {/* Location Input */}
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-700 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filter location (e.g. USA)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_0_#0f172a] transition"
          />
        </div>

        {/* Category Select */}
        <div className="relative">
          <Tag className="w-4 h-4 text-slate-700 absolute left-3.5 top-3" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_0_#0f172a] transition appearance-none cursor-pointer"
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
        <div className="relative">
          <Briefcase className="w-4 h-4 text-slate-700 absolute left-3.5 top-3" />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_0_#0f172a] transition appearance-none cursor-pointer"
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
