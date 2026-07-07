import React, { useMemo } from 'react';
import hljs from 'highlight.js';
import { Eye, Code } from 'lucide-react';

interface PreviewProps {
  htmlContent: string;
  activeTab: 'preview' | 'html';
  setActiveTab: (tab: 'preview' | 'html') => void;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
}

// Helper to format HTML for the source code tab
const formatHtmlString = (html: string): string => {
  if (!html) return '';
  let indent = 0;
  const tab = '  ';
  let result = '';
  
  const tokens = html.split(/(<\/?[a-zA-Z0-9:-]+[^>]*>)/g).filter(t => t.trim() !== '');
  
  tokens.forEach((token, index) => {
    const isTag = token.startsWith('<') && token.endsWith('>');
    const isClosing = token.startsWith('</');
    const isSelfClosing = token.endsWith('/>') || /<(img|hr|br|input)\b/i.test(token);
    
    if (isTag) {
      if (isClosing) {
        indent = Math.max(0, indent - 1);
        result += '\n' + tab.repeat(indent) + token;
      } else {
        const isInline = /<(span|strong|em|a|code|input|b|i)\b/i.test(token);
        
        if (!isInline && index > 0) {
          result += '\n' + tab.repeat(indent);
        }
        
        result += token;
        
        if (!isSelfClosing && !isInline) {
          indent += 1;
        }
      }
    } else {
      result += token.trim();
    }
  });
  
  return result.trim();
};

export const Preview: React.FC<PreviewProps> = ({
  htmlContent,
  activeTab,
  setActiveTab,
  previewRef,
  onScroll,
  onMouseEnter,
}) => {
  const highlightedHtml = useMemo(() => {
    const formatted = formatHtmlString(htmlContent);
    try {
      return hljs.highlight(formatted, { language: 'html' }).value;
    } catch {
      return formatted;
    }
  }, [htmlContent]);

  return (
    <div className="preview-container-print flex-1 flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Tabs Header */}
      <div className="hide-on-print flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex gap-1 py-1.5">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            LIVE PREVIEW
          </button>
          
          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'html'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            HTML CODE
          </button>
        </div>
        <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
          {activeTab === 'preview' ? 'RENDERED HTML' : 'SOURCE OUTPUT'}
        </span>
      </div>

      <div 
        ref={previewRef}
        onScroll={onScroll}
        onMouseEnter={onMouseEnter}
        className="preview-scroll-area-print flex-1 overflow-y-auto p-6"
      >
        {activeTab === 'preview' ? (
          htmlContent ? (
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <Eye className="h-10 w-10 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">Your preview will appear here</p>
            </div>
          )
        ) : (
          htmlContent ? (
            <pre className="font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-900 dark:bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-200 dark:border-slate-800 select-all">
              <code
                className="language-html hljs"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <Code className="h-10 w-10 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">HTML source code will appear here</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
