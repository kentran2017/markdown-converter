import React, { useState } from 'react';
import { Plus, Trash2, Edit2, FileText, X, Check, Download, Upload } from 'lucide-react';

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface SidebarProps {
  documents: DocumentItem[];
  activeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onImportBackup: (importedDocs: DocumentItem[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeId,
  isOpen,
  onClose,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  onImportBackup,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (doc: DocumentItem) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  // Export Backup JSON
  const handleExportBackup = () => {
    try {
      const dataStr = JSON.stringify(documents, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'markdown_notebook_backup.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Backup export failed:', e);
    }
  };

  // Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
            onImportBackup(parsed);
          } else {
            alert('Invalid backup file! Must be a valid Markdown Notebook export JSON.');
          }
        } catch (err) {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input to allow re-triggering
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
      />

      {/* Sidebar Panel */}
      <aside className="hide-on-print fixed inset-y-0 left-0 w-80 glass-panel border-r shadow-2xl flex flex-col z-45 animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">MY NOTEBOOK</span>
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
              {documents.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-655"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Create Document Button */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <button
            onClick={onCreate}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/10 active:scale-97 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Document</span>
          </button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {documents.map((doc) => {
            const isActive = doc.id === activeId;
            const isEditing = doc.id === editingId;

            return (
              <div
                key={doc.id}
                onClick={() => !isEditing && onSelect(doc.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-indigo-50/50 border-indigo-100/50 dark:bg-indigo-950/20 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'bg-transparent border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileText className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveRename(doc.id)}
                      onKeyDown={(e) => handleKeyDown(e, doc.id)}
                      autoFocus
                      className="w-full bg-white dark:bg-slate-800 text-xs px-2 py-1 rounded border border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-semibold truncate">
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(doc);
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    {documents.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(doc.id);
                        }}
                        className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveRename(doc.id);
                    }}
                    className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Backup and Restore (Bottom section) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 flex gap-2">
          {/* Hidden input for importing backup */}
          <input
            type="file"
            id="import-backup-file"
            accept=".json"
            onChange={handleImportBackup}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('import-backup-file')?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-900/60 text-[10px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-900 text-center active:scale-95 transition-all"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import Backup</span>
          </button>
          
          <button
            onClick={handleExportBackup}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-900/60 text-[10px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-900 text-center active:scale-95 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Backup</span>
          </button>
        </div>
      </aside>
    </>
  );
};
