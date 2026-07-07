import React from 'react';
import { X, HelpCircle, Bold, Italic, Hash, Link, Image, List, ListOrdered, Quote, Code, Table, CheckSquare, Plus } from 'lucide-react';

interface CheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (template: string) => void;
}

interface SyntaxItem {
  name: string;
  syntax: string;
  template: string;
  icon?: React.ReactNode;
}

interface CategoryGroup {
  category: string;
  items: SyntaxItem[];
}

export const CheatSheet: React.FC<CheatSheetProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  if (!isOpen) return null;

  const categories: CategoryGroup[] = [
    {
      category: 'Basic Formatting',
      items: [
        { name: 'Heading 1', syntax: '# Text', template: '# Heading 1\n', icon: <Hash className="h-3.5 w-3.5" /> },
        { name: 'Heading 2', syntax: '## Text', template: '## Heading 2\n', icon: <Hash className="h-3.5 w-3.5" /> },
        { name: 'Bold', syntax: '**Text**', template: '**Bold Text**', icon: <Bold className="h-3.5 w-3.5" /> },
        { name: 'Italic', syntax: '*Text*', template: '*Italic Text*', icon: <Italic className="h-3.5 w-3.5" /> },
        { name: 'Link', syntax: '[Text](url)', template: '[Google](https://google.com)', icon: <Link className="h-3.5 w-3.5" /> },
        { name: 'Image', syntax: '![alt](url)', template: '![Logo](https://picsum.photos/200)', icon: <Image className="h-3.5 w-3.5" /> },
      ]
    },
    {
      category: 'Lists & Layout',
      items: [
        { name: 'Unordered List', syntax: '- Item', template: '- Bullet item\n- Bullet item\n', icon: <List className="h-3.5 w-3.5" /> },
        { name: 'Ordered List', syntax: '1. Item', template: '1. First item\n2. Second item\n', icon: <ListOrdered className="h-3.5 w-3.5" /> },
        { name: 'Task List', syntax: '- [ ] Item', template: '- [ ] Uncompleted task\n- [x] Completed task\n', icon: <CheckSquare className="h-3.5 w-3.5" /> },
        { name: 'Blockquote', syntax: '> Quote', template: '> "This is a blockquote."\n', icon: <Quote className="h-3.5 w-3.5" /> },
        { name: 'Horizontal Rule', syntax: '---', template: '\n---\n', icon: <Plus className="h-3.5 w-3.5" /> },
      ]
    },
    {
      category: 'Code & Tables',
      items: [
        { name: 'Inline Code', syntax: '`code`', template: '`inline code`', icon: <Code className="h-3.5 w-3.5" /> },
        { name: 'Code Block', syntax: '```lang', template: '```javascript\nconsole.log("Hello World");\n```\n', icon: <Code className="h-3.5 w-3.5" /> },
        { name: 'Table', syntax: '| A | B |', template: '| Column 1 | Column 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n', icon: <Table className="h-3.5 w-3.5" /> },
      ]
    },
    {
      category: 'LaTeX Mathematics',
      items: [
        { name: 'Inline Formula', syntax: '$E=mc^2$', template: '$a^2 + b^2 = c^2$' },
        { name: 'Block Formula', syntax: '$$\\sum x^2$$', template: '$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$\n' },
      ]
    }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 lg:hidden"
      />

      {/* Drawer Panel */}
      <aside className="hide-on-print fixed inset-y-0 right-0 w-80 glass-panel border-l shadow-2xl flex flex-col z-45 animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-sm">
            <HelpCircle className="h-4.5 w-4.5 text-indigo-500" />
            <span>SYNTAX CHEAT SHEET</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Click any item below to insert its formatting template at the editor cursor position.
          </p>

          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {cat.category}
              </h4>
              
              <div className="grid grid-cols-1 gap-2">
                {cat.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => onInsert(item.template)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/50 hover:border-indigo-400 bg-white/50 hover:bg-indigo-50/20 active:scale-98 text-left transition-all dark:bg-slate-900/40 dark:border-slate-800/60 dark:hover:border-indigo-900/60 dark:hover:bg-indigo-950/10"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.icon && <span className="text-slate-400 shrink-0">{item.icon}</span>}
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 truncate">
                        {item.name}
                      </span>
                    </div>
                    <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 shrink-0">
                      {item.syntax}
                    </code>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
