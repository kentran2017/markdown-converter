import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="hide-on-print glass-panel w-full py-2.5 px-6 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 border-t">
      <span>© {new Date().getFullYear()} Markdown Converter</span>
    </footer>
  );
};
