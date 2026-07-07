import React, { useRef, useMemo } from 'react';
import { Upload, Copy, Download, Sun, Moon, Check, Printer } from 'lucide-react';

interface ToolbarProps {
  markdownValue: string;
  onUpload: (content: string) => void;
  onCopyHtml: () => void;
  onDownloadHtml: () => void;
  onPrintPdf: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  copySuccess: boolean;
  wordGoal: number;
  onSetWordGoal: (goal: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  markdownValue,
  onUpload,
  onCopyHtml,
  onDownloadHtml,
  onPrintPdf,
  darkMode,
  onToggleDarkMode,
  copySuccess,
  wordGoal,
  onSetWordGoal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const chars = markdownValue.length;
    const words = markdownValue.trim() === '' 
      ? 0 
      : markdownValue.trim().split(/\s+/).filter(Boolean).length;
    return { chars, words };
  }, [markdownValue]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          onUpload(event.target.result);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="toolbar-container-print hide-on-print glass-panel w-full p-2 sm:p-4 flex flex-row items-center justify-between gap-2 rounded-2xl shadow-sm border relative overflow-hidden">
      
      {/* Word & Character Count Stats (Left) */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-1">
            <span className="hidden xs:inline">Words:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{stats.words}</span>
            {wordGoal > 0 && (
              <span className="text-[10px] text-slate-400 font-mono">/{wordGoal}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] border-l border-slate-250 dark:border-slate-700 pl-1.5 sm:pl-2">
            <span className="text-slate-400 hidden xs:inline">Goal:</span>
            <input
              type="number"
              value={wordGoal || ''}
              onChange={(e) => onSetWordGoal(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Goal"
              className="w-10 sm:w-12 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-1 py-0.5 rounded text-center text-xs font-mono focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
              title="Set target word count"
            />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/50 h-full">
          <span>Characters:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{stats.chars}</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md,text/markdown,text/plain"
        className="hidden"
      />

      {/* Action Buttons (Right) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Upload MD Button */}
        <button
          onClick={triggerFileUpload}
          className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700"
          title="Upload Markdown file"
        >
          <Upload className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          <span className="hidden md:inline">Upload</span>
        </button>

        {/* Copy HTML Button */}
        <button
          onClick={onCopyHtml}
          className={`flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all ${
            copySuccess
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/10'
          }`}
          title="Copy HTML to clipboard"
        >
          {copySuccess ? <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
          <span className="hidden md:inline">{copySuccess ? 'Copied!' : 'Copy HTML'}</span>
        </button>

        {/* Download HTML Button */}
        <button
          onClick={onDownloadHtml}
          className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700"
          title="Download styled HTML file"
        >
          <Download className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          <span className="hidden md:inline">Download</span>
        </button>

        {/* Export PDF Button */}
        <button
          onClick={onPrintPdf}
          className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700"
          title="Export to PDF / Print"
        >
          <Printer className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          <span className="hidden md:inline">Export PDF</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white shadow-sm active:scale-95 transition-all hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Full-width Word Count Goal Progress Bar at the bottom */}
      {wordGoal > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800">
          <div 
            className={`h-full transition-all duration-300 ${
              stats.words >= wordGoal ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(100, (stats.words / wordGoal) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
