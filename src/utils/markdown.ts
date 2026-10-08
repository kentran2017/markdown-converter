import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import katex from 'katex';

// Helper to escape HTML characters safely and avoid circular dependency on 'md'
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Inline math parser rule ($math$)
function mathInlineRule(state: any, silent: boolean): boolean {
  let start = state.pos;
  if (state.src.charCodeAt(start) !== 0x24 /* $ */) {
    return false;
  }

  // Check if escaped
  if (start > 0 && state.src.charCodeAt(start - 1) === 0x5C /* \ */) {
    return false;
  }

  // Find closing $
  let match = start + 1;
  while (match < state.src.length) {
    if (state.src.charCodeAt(match) === 0x24 /* $ */) {
      // Check if escaped
      if (state.src.charCodeAt(match - 1) !== 0x5C /* \ */) {
        break;
      }
    }
    match++;
  }

  if (match === state.src.length) {
    return false;
  }

  // Inline math cannot be empty
  if (match - start === 1) {
    return false;
  }

  if (!silent) {
    const content = state.src.slice(start + 1, match);
    const token = state.push('math_inline', 'math', 0);
    token.markup = '$';
    token.content = content.trim();
  }

  state.pos = match + 1;
  return true;
}

// Block math parser rule ($$math$$)
function mathBlockRule(state: any, startLine: number, endLine: number, silent: boolean): boolean {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  // Must start with $$
  if (pos + 2 > max || state.src.slice(pos, pos + 2) !== '$$') {
    return false;
  }

  if (silent) {
    return true;
  }

  // Find closing $$
  let nextLine = startLine;
  let content = '';
  let found = false;

  // Check if closing $$ is on the same line
  const firstLineContent = state.src.slice(pos + 2, max);
  if (firstLineContent.trim().endsWith('$$')) {
    content = firstLineContent.slice(0, firstLineContent.lastIndexOf('$$'));
    found = true;
  } else {
    // Search in subsequent lines
    content = firstLineContent;
    for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
      const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const lineEnd = state.eMarks[nextLine];
      const lineText = state.src.slice(lineStart, lineEnd);
      
      if (lineText.trim().startsWith('$$')) {
        found = true;
        // Append text before closing $$ if any
        const closingPos = lineText.indexOf('$$');
        content += '\n' + lineText.slice(0, closingPos);
        break;
      }
      content += '\n' + lineText;
    }
  }

  if (!found) {
    return false;
  }

  state.line = nextLine + 1;
  const token = state.push('math_block', 'math', 0);
  token.block = true;
  token.markup = '$$';
  token.content = content.trim();
  
  return true;
}

// Configure highlight.js to load languages on-demand
const md = new MarkdownIt({
  html: true,        // Enable HTML tags in source
  linkify: true,     // Autoconvert URL-like text to links
  typographer: true, // Enable smartquotes and other typographic enhancements
  highlight: (code: string, lang: string): string => {
    // Generate a unique ID for the code block
    const id = 'code-' + Math.random().toString(36).substr(2, 9);
    const b64Code = btoa(encodeURIComponent(code));

    // Copy button HTML structure using Lucide-like SVG
    const copyButton = `
      <button
        class="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100"
        title="Copy code"
        data-code="${b64Code}"
        onclick="
          const rawCode = decodeURIComponent(atob(this.getAttribute('data-code')));
          navigator.clipboard.writeText(rawCode);
          this.innerHTML = '<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><polyline points=\\'20 6 9 17 4 12\\'></polyline></svg>';
          this.classList.add('text-emerald-400');
          setTimeout(() => {
            this.innerHTML = '<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'9\\' y=\\'9\\' width=\\'13\\' height=\\'13\\' rx=\\'2\\' ry=\\'2\\'></rect><path d=\\'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\\'></path></svg>';
            this.classList.remove('text-emerald-400');
          }, 2000);
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
    `;

    let highlightedCode = '';
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlightedCode = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
      } catch (e) {
        console.error('Highlight error:', e);
      }
    }

    if (!highlightedCode) {
      try {
        highlightedCode = hljs.highlightAuto(code).value;
      } catch {
        highlightedCode = escapeHtml(code);
      }
    }

    return `<div class="relative group my-4"><pre class="hljs !m-0"><code id="${id}">${highlightedCode}</code></pre>${copyButton}</div>`;
  }
});

// Register KaTeX rules into markdown-it parser
md.inline.ruler.after('escape', 'math_inline', mathInlineRule);
md.block.ruler.after('blockquote', 'math_block', mathBlockRule, {
  alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
});

// Define rendering behavior for math tokens
md.renderer.rules.math_inline = (tokens, idx) => {
  try {
    return katex.renderToString(tokens[idx].content, {
      displayMode: false,
      throwOnError: false
    });
  } catch (e) {
    console.error('KaTeX inline error:', e);
    return `<span class="text-rose-500 font-mono">${escapeHtml(tokens[idx].content)}</span>`;
  }
};

md.renderer.rules.math_block = (tokens, idx) => {
  try {
    return `<div class="math-block my-4 overflow-x-auto text-center py-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/40">${
      katex.renderToString(tokens[idx].content, {
        displayMode: true,
        throwOnError: false
      })
    }</div>`;
  } catch (e) {
    console.error('KaTeX block error:', e);
    return `<pre class="text-rose-500 font-mono">${escapeHtml(tokens[idx].content)}</pre>`;
  }
};

/**
 * Converts markdown string into clean HTML.
 * Also parses task lists ([ ] and [x]) into checkboxes and styles them.
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Render markdown with markdown-it (now includes KaTeX)
  let html = md.render(markdown);

  // Post-process the generated HTML to support GitHub-style task lists
  html = html.replace(
    /<li>\s*\[\s*\]\s*(.*?)<\/li>/gi,
    `<li class="flex items-start gap-2 list-none py-0.5">
      <input type="checkbox" disabled class="mt-1 h-4 w-4 shrink-0 rounded-sm border-slate-300 dark:border-slate-600 text-indigo-500 focus:ring-indigo-500" />
      <span class="text-slate-700 dark:text-slate-300">$1</span>
    </li>`
  );

  html = html.replace(
    /<li>\s*\[[xX]\]\s*(.*?)<\/li>/gi,
    `<li class="flex items-start gap-2 list-none py-0.5">
      <input type="checkbox" checked disabled class="mt-1 h-4 w-4 shrink-0 rounded-sm border-slate-300 dark:border-slate-600 text-indigo-500 focus:ring-indigo-500" />
      <span class="line-through text-slate-400 dark:text-slate-500">$1</span>
    </li>`
  );

  return html;
}
