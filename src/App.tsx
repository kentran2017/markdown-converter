import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { convertMarkdownToHtml } from './utils/markdown';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import type { DocumentItem } from './components/Sidebar';
import { CheatSheet } from './components/CheatSheet';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DEFAULT_MARKDOWN = `# Markdown to HTML Converter 🚀

Welcome! This is a modern, real-time Markdown to HTML converter that runs entirely in your browser.

## Features Supported:
- **Scroll Sync** (proportional editor & preview cuộn đồng bộ)
- **Document History Notebook** (collapsible left panel)
- **Syntax Cheat Sheet** (collapsible right panel, click to insert template)
- **LaTeX Math support** (inline math like $e^{i\\pi} + 1 = 0$ or block math)

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

- **Real-time preview** (updates as you type!)
- **Drag & drop** or upload local \`.md\` files
- **Copy HTML source** with one click
- **Download HTML file** with embedded styled document layout
- **Dark & light modes** (remembered automatically)
- **Syntax highlighting** for code blocks

---

## Formatting Examples

### 1. Basic Text Styling
You can write text in **bold**, *italic*, or ~~strikethrough~~.
Create lists easily:
1. First item
2. Second item
   - Sub-item A
   - Sub-item B

### 2. Code Block (Syntax Highlighted)
\`\`\`javascript
// Quick JS function to say hello
function greetUser(name = 'Guest') {
  console.log(\`Hello, \${name}! Welcome to the app.\`);
}

greetUser('Developer');
\`\`\`

### 3. Task Lists
- [x] Create a beautiful UI
- [x] Configure markdown-it
- [x] Integrate KaTeX
- [x] Build Document Sidebar manager
- [ ] Add line numbers to editor

### 4. Tables
| Feature | Supported | Performance |
| :--- | :---: | :---: |
| Real-time Render | Yes | Ultra-fast |
| LaTeX Math | Yes | High |
| Document Autosave | Yes | Instant |

### 5. Blockquotes
> "Markdown is a lightweight markup language with plain-text-formatting syntax. Its design allows it to be converted to many formats, but it was originally created to convert to HTML." - John Gruber
`;

export const App: React.FC = () => {
  // Document Collection state
  const [documents, setDocuments] = useLocalStorage<DocumentItem[]>('md_converter_docs', [
    {
      id: 'doc_default',
      title: 'Welcome Draft.md',
      content: DEFAULT_MARKDOWN,
      updatedAt: Date.now(),
    }
  ]);
  const [activeDocId, setActiveDocId] = useLocalStorage<string>('md_converter_active_doc', 'doc_default');

  // Theme, Sidebar and Drawer state
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('md_converter_theme', true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'html'>('preview');

  // Scroll Sync states
  const [scrollSync, setScrollSync] = useLocalStorage<boolean>('md_converter_scroll_sync', true);
  const [scrollActive, setScrollActive] = useState<'editor' | 'preview' | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Word count writing goal
  const [wordGoal, setWordGoal] = useLocalStorage<number>('md_converter_word_goal', 0);

  // Refs for Scroll Sync
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Sync dark mode class to HTML/Body tags
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (darkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [darkMode]);

  // Temporarily disable dark mode during browser print to preserve rich light-theme colors and syntax highlighting
  useEffect(() => {
    const handleBeforePrint = () => {
      if (darkMode) {
        window.document.documentElement.classList.remove('dark');
        window.document.body.classList.remove('dark');
      }
    };

    const handleAfterPrint = () => {
      if (darkMode) {
        window.document.documentElement.classList.add('dark');
        window.document.body.classList.add('dark');
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [darkMode]);

  // Find active document
  const activeDoc = documents.find((doc) => doc.id === activeDocId) || documents[0];

  // Fallback check if activeDoc is deleted or missing
  useEffect(() => {
    if (!activeDoc && documents.length > 0) {
      setActiveDocId(documents[0].id);
    }
  }, [documents, activeDoc, setActiveDocId]);

  const activeContent = activeDoc ? activeDoc.content : '';

  // Update active document content
  const handleContentChange = (newContent: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === activeDocId
          ? { ...doc, content: newContent, updatedAt: Date.now() }
          : doc
      )
    );
  };

  // Create document
  const handleCreateDocument = () => {
    const newId = `doc_${Date.now()}`;
    const newDoc: DocumentItem = {
      id: newId,
      title: `Untitled Document ${documents.length + 1}.md`,
      content: '# Untitled Document\n\nType your content here...',
      updatedAt: Date.now(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newId);
    showToast('New document created!', 'success');
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    if (documents.length <= 1) return; // Keep at least one doc

    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    showToast('Document deleted!', 'success');
  };

  // Rename document
  const handleRenameDocument = (id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, title: newTitle.endsWith('.md') ? newTitle : `${newTitle}.md`, updatedAt: Date.now() }
          : doc
      )
    );
    showToast('Document renamed!', 'success');
  };

  // Import backup and merge
  const handleImportBackup = (imported: DocumentItem[]) => {
    setDocuments((current) => {
      const merged = [...current];
      imported.forEach((impDoc) => {
        const index = merged.findIndex((d) => d.id === impDoc.id);
        if (index > -1) {
          merged[index] = impDoc;
        } else {
          merged.push(impDoc);
        }
      });
      return merged;
    });
    showToast('Backup imported and merged successfully!', 'success');
  };

  // Print Preview / Export to PDF
  const handlePrintPdf = () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      setTimeout(() => {
        window.print();
      }, 100);
    } else {
      window.print();
    }
  };

  // Proportional scroll synchronization handler
  const handleEditorScroll = () => {
    if (!scrollSync || scrollActive !== 'editor') return;
    const editor = textareaRef.current;
    const preview = previewRef.current;
    if (editor && preview) {
      const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    }
  };

  const handlePreviewScroll = () => {
    if (!scrollSync || scrollActive !== 'preview') return;
    const editor = textareaRef.current;
    const preview = previewRef.current;
    if (editor && preview) {
      const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
    }
  };

  // Cheat Sheet cursor insertion
  const handleInsertTemplate = (template: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newValue = before + template + after;
      
      // Save current scroll position to prevent view jumping to top
      const currentScrollTop = textarea.scrollTop;
      
      handleContentChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + template.length;
        textarea.scrollTop = currentScrollTop;
      }, 0);
    } else {
      // Fallback
      handleContentChange(activeContent + template);
    }
  };

  // Compute HTML content in real time
  const htmlContent = React.useMemo(() => {
    return convertMarkdownToHtml(activeContent);
  }, [activeContent]);

  // Copy HTML to Clipboard
  const handleCopyHtml = async () => {
    if (!htmlContent) {
      showToast('No HTML content to copy', 'error');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopySuccess(true);
      showToast('HTML successfully copied to clipboard!', 'success');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  // Download styled or plain HTML
  const handleDownloadHtml = () => {
    if (!htmlContent) {
      showToast('No HTML content to download', 'error');
      return;
    }

    try {
      // Premium Stylesheet embedding
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeDoc?.title.replace('.md', '') || 'Converted Document'}</title>
  <!-- KaTeX CSS for math equations rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 850px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      background-color: #f8fafc;
    }
    .document-card {
      background: #ffffff;
      padding: 3.5rem 3rem;
      border-radius: 1.25rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
      border: 1px solid #e2e8f0;
    }
    h1 { font-size: 2.25rem; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 0; margin-bottom: 1.5rem; color: #0f172a; }
    h2 { font-size: 1.75rem; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.35rem; margin-top: 2rem; margin-bottom: 1rem; color: #1e293b; }
    h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #334155; }
    p { margin-bottom: 1.25rem; color: #334155; }
    a { color: #4f46e5; text-decoration: underline; text-underline-offset: 4px; }
    a:hover { color: #4338ca; }
    ul { list-style-type: disc; margin-bottom: 1.25rem; padding-left: 1.5rem; }
    ol { list-style-type: decimal; margin-bottom: 1.25rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.35rem; }
    blockquote { border-left: 4px solid #cbd5e1; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #64748b; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.875em; background-color: #f1f5f9; padding: 0.2rem 0.4rem; rounded: 0.25rem; color: #e11d48; }
    pre { background-color: #0f172a; border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; margin: 1.5rem 0; }
    pre code { background-color: transparent; color: #f8fafc; padding: 0; font-size: 0.875rem; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem; }
    th { background-color: #f8fafc; font-weight: 600; text-align: left; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; }
    td { border: 1px solid #e2e8f0; padding: 0.75rem 1rem; }
    tr:nth-child(even) { background-color: #f8fafc; }
    hr { border: 0; border-top: 2px dashed #e2e8f0; margin: 2rem 0; }
    .task-list-item { display: flex; align-items: center; gap: 0.5rem; }
    .task-list-item input[type="checkbox"] { border-radius: 0.25rem; border: 1px solid #cbd5e1; width: 1rem; height: 1rem; }
  </style>
</head>
<body>
  <div class="document-card">
    ${htmlContent}
  </div>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', activeDoc?.title.replace('.md', '.html') || 'converted_markdown.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Styled HTML downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download failed: ', err);
      showToast('Failed to download HTML file', 'error');
    }
  };

  // Show Toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Clear toast timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Header />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Collapsible Document Sidebar */}
        <Sidebar
          documents={documents}
          activeId={activeDocId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelect={setActiveDocId}
          onCreate={handleCreateDocument}
          onDelete={handleDeleteDocument}
          onRename={handleRenameDocument}
          onImportBackup={handleImportBackup}
        />

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden p-6 gap-6 max-w-7xl w-full mx-auto">
          {/* Editor and Preview Split Container */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            <Editor 
              value={activeContent} 
              onChange={handleContentChange} 
              textareaRef={textareaRef}
              onScroll={handleEditorScroll}
              onMouseEnter={() => setScrollActive('editor')}
              scrollSync={scrollSync}
              onToggleScrollSync={() => setScrollSync(!scrollSync)}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
              documentTitle={activeDoc?.title || 'Draft.md'}
            />
            
            <Preview 
              htmlContent={htmlContent} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              previewRef={previewRef}
              onScroll={handlePreviewScroll}
              onMouseEnter={() => setScrollActive('preview')}
            />
          </div>

          {/* Toolbar */}
          <Toolbar
            markdownValue={activeContent}
            onUpload={handleContentChange}
            onCopyHtml={handleCopyHtml}
            onDownloadHtml={handleDownloadHtml}
            onPrintPdf={handlePrintPdf}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            copySuccess={copySuccess}
            wordGoal={wordGoal}
            onSetWordGoal={setWordGoal}
          />
        </main>

        {/* Collapsible Cheat Sheet Drawer */}
        <CheatSheet
          isOpen={isCheatSheetOpen}
          onClose={() => setIsCheatSheetOpen(false)}
          onInsert={handleInsertTemplate}
        />
      </div>

      <Footer />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-950 shadow-xl backdrop-blur-md text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 animate-slide-up z-50 border border-white/10 dark:border-slate-200/20">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
