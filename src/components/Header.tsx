import React from 'react';
import { FileEdit } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="hide-on-print glass-panel sticky top-0 z-10 w-full px-4 py-2.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
          <FileEdit className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Markdown to HTML
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">
            Real-time browser-based converter
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          All Local & Safe
        </span>
      </div>
    </header>
  );
};
