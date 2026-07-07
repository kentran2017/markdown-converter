import React from 'react';
import { Terminal } from 'lucide-react';

const GithubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="hide-on-print glass-panel w-full py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3 border-t">
      <div className="flex items-center gap-1.5 font-medium">
        <Terminal className="h-4 w-4 text-indigo-500" />
        <span>Built with React + Vite + Tailwind CSS</span>
      </div>
      <div className="flex items-center gap-4">
        <span>© {new Date().getFullYear()} Markdown Converter</span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <GithubIcon className="h-3.5 w-3.5" />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
};
