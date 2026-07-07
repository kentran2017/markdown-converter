# Premium Markdown to HTML Converter & Notebook 🚀

A fast, lightweight, and beautiful browser-based Markdown editor and converter. This application operates entirely on the client side (100% private and safe) and provides a feature-rich workspace for editing, organizing, and exporting Markdown documents.

## Key Features

- **Document History Notebook (Sidebar)**: Create, rename, delete, and manage multiple drafts. All documents are automatically autosaved to `localStorage`.
- **Proportional Scroll Sync**: Smooth, synchronous scrolling between the editor and live preview panel (can be toggled on/off).
- **LaTeX Math Rendering**: Native support for mathematical expressions using KaTeX (inline math `$E=mc^2$` and block math `$$\sum x^2$$`).
- **Syntax Cheat Sheet**: Slide-out drawer with code templates. Insert Markdown templates directly at your cursor location with a single click.
- **Smart PDF Export**: Print or export clean, multi-page PDFs. The print stylesheet automatically hides UI controls, configures report margins (`20mm`), and temporarily toggles to a high-contrast Light Theme to preserve syntax highlighting colors.
- **Styled HTML Download**: Download complete HTML documents with premium CSS embedded directly in the file, making it ready to open offline.
- **Backup & Restore**: Export all your drafts as a single `.json` backup file and import them back on any device.
- **Fluid Dark & Light Modes**: Beautifully synchronized theme transitions (no-flicker on refresh).
- **Responsive Mobile Layout**: Single-column segmented layout ("EDIT" / "PREVIEW" switcher) optimized for phone screens and keyboards, with custom safe-area margins.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Markdown Parser**: `markdown-it` (with custom GFM task-lists support)
- **Syntax Highlighting**: `highlight.js`
- **Math Engine**: `katex`
- **Icons**: `lucide-react`

---

## Getting Started

Follow these steps to run the application locally on your computer:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (recommended version: v18 or higher).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kentran2017/markdown-converter.git
   ```

2. **Navigate to the project folder**:
   ```bash
   cd markdown-converter
   ```

3. **Install the dependencies**:
   ```bash
   npm install
   ```

### Local Development

Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:5173/`** to run the app.

### Build for Production

Compile and optimize the project for production:
```bash
npm run build
```
This generates static files inside the **`dist`** directory, optimized and ready to deploy on any web server.

---

## Deployment (Vercel)

This application is a Single Page Application (SPA), making it compatible with free hosting providers like Vercel:

1. Sign up/log in on [Vercel](https://vercel.com/) and connect your GitHub account.
2. Click **Add New** > **Project** and import `markdown-converter` from your repository list.
3. Keep the default settings and click **Deploy**.
4. Vercel will build the project and host it online with automatic SSL (HTTPS). Every time you push new code to GitHub, Vercel will automatically redeploy the updates!

## License

This project is open-source and free to use.
