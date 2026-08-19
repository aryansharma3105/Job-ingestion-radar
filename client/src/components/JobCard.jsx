import React, { useState } from 'react';
import { ExternalLink, Building2, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function JobCard({ job }) {
  const [showDescription, setShowDescription] = useState(false);

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recently';
    const date = new Date(isoStr);
    return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="group bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 hover:-translate-y-1.5 hover:shadow-[9px_9px_0_0_#0f172a] shadow-[5px_5px_0_0_#0f172a] transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black font-mono">
            <span className="px-3 py-1 rounded-xl bg-sky-200 border-2 border-slate-900 text-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a] group-hover:bg-sky-300 transition-colors">
              {job.category || 'General'}
            </span>
            {job.jobType && (
              <span className="px-3 py-1 rounded-xl bg-purple-200 border-2 border-slate-900 text-slate-900 shadow-[1.5px_1.5px_0_0_#0f172a] group-hover:bg-purple-300 transition-colors">
                {capitalize(job.jobType)}
              </span>
            )}
          </div>

          {/* Explicit Source Attribution Sticker */}
          <div className="text-[11px] font-mono font-black text-slate-900 bg-yellow-200 px-2.5 py-1 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] flex items-center gap-1 group-hover:rotate-2 transition-transform">
            <span>SOURCE:</span>
            <span className="uppercase">{job.source || 'Remotive'}</span>
          </div>
        </div>

        {/* Job Title */}
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug font-sans group-hover:text-sky-700 transition-colors">
          {job.title}
        </h3>

        {/* Company & Location */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-900/40">
            <Building2 className="w-4 h-4 text-slate-900" />
            <span className="text-slate-900 font-black">{job.company}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-900/40">
            <MapPin className="w-4 h-4 text-slate-900" />
            <span>{job.location || 'Remote'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-900" />
            <span>{formatDate(job.publishedAt)}</span>
          </div>
        </div>

        {/* Description snippet toggle */}
        {job.description && (
          <div className="mt-3.5">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="text-xs text-slate-900 hover:text-sky-600 flex items-center gap-1 font-black underline decoration-2 transition cursor-pointer"
            >
              <span>{showDescription ? 'Hide Details' : 'View Description Snippet'}</span>
              {showDescription ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDescription && (
              <div 
                className="mt-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-900 text-xs text-slate-800 max-h-48 overflow-y-auto font-sans leading-relaxed shadow-inner"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-3.5 border-t-2 border-slate-900/20 flex items-center justify-between gap-3 text-xs">
        <span className="text-[11px] font-mono font-extrabold text-slate-500">ID: #{job.externalId}</span>

        {/* View Original Listing Link */}
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-yellow-300 hover:bg-yellow-400 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0f172a] active:translate-x-1 active:translate-y-1 active:shadow-none font-black text-slate-900 border-2 border-slate-900 shadow-[2.5px_2.5px_0_0_#0f172a] transition-all duration-150 text-xs font-mono"
        >
          <span>View Listing</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
        </a>
      </div>
    </div>
  );
}
