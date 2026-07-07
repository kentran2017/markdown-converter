import React from 'react';
import { UploadCloud, FileText, Menu, HelpCircle, Link as LinkIcon, Link2Off } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  onMouseEnter: () => void;
  scrollSync: boolean;
  onToggleScrollSync: () => void;
  onOpenSidebar: () => void;
  onOpenCheatSheet: () => void;
  documentTitle: string;
}

export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder = 'Type your Markdown here...',
  textareaRef,
  onScroll,
  onMouseEnter,
  scrollSync,
  onToggleScrollSync,
  onOpenSidebar,
  onOpenCheatSheet,
  documentTitle,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Handle Drag Leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.md') || file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            onChange(event.target.result);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="editor-container-print hide-on-print relative flex-1 flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500"
    >
      {/* Editor Header Tab controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-850/50 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Open Notebook"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          
          <div className="flex items-center gap-1.5 min-w-0 text-slate-500 dark:text-slate-400">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-bold truncate max-w-[120px] sm:max-w-none">
              {documentTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Scroll Sync Button */}
          <button
            onClick={onToggleScrollSync}
            className={`p-1.5 rounded-lg active:scale-95 transition-all ${
              scrollSync
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-transparent'
            }`}
            title={scrollSync ? 'Scroll Sync Enabled' : 'Scroll Sync Disabled'}
          >
            {scrollSync ? <LinkIcon className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenCheatSheet}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 transition-all"
            title="Markdown Help"
          >
            <HelpCircle className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={onScroll}
          onMouseEnter={onMouseEnter}
          placeholder={placeholder}
          className="w-full h-full p-6 bg-transparent resize-none font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 outline-none border-0 focus:ring-0 overflow-y-auto"
        />

        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm m-2 border-2 border-dashed border-indigo-400 dark:border-indigo-500 rounded-xl transition-all duration-200 z-10 pointer-events-none animate-fade-in">
            <UploadCloud className="h-10 w-10 text-indigo-500 dark:text-indigo-400 animate-bounce mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drop Markdown file here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports .md and text files
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
