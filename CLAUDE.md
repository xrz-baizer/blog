# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VitePress project used for generating a static website, likely for documentation or a blog.

## Common Commands

- **`npm run dev`**: Starts the development server with hot-reloading. The site will be available at `http://localhost:5173` by default. The `--open` flag will automatically open it in your browser.
- **`npm run build`**: Builds the static site for production. The output will be in the `docs/.vitepress/dist` directory.
- **`npm run preview`**: Serves the built static site locally to preview it before deployment. It will be available at `http://localhost:8082`.

## Code Architecture

This VitePress site's content is located in the `docs` directory. The main configuration is in `docs/.vitepress/config.mts`.

### Content Structure
- The main content is organized into three categories within the `docs` directory:
  - `01-Essay/`: For essays or blog posts.
  - `00-TechnicalFile/`: For technical articles.
  - `02-Other/`: For any other content.
- The top-level navigation bar is configured in `docs/.vitepress/config.mts` to point to these directories.

### Sidebar
- The sidebar is automatically generated from the file and directory structure within `docs` using `vite-plugin-vitepress-auto-sidebar`.
- To add a new item to the sidebar, simply add a new `.md` file or a new directory within the content folders (`01-Essay`, `00-TechnicalFile`, etc.).
- The sidebar generation ignores `index.md` files and the `Image` directory.
- Files and folders are sorted with folders appearing first.
- Numbered prefixes (e.g., `01-`, `001-`) are used for ordering and are automatically removed from the displayed text in the sidebar.

### Customizations
- The project uses several Markdown extensions, including task lists (`- [ ]`) and highlighted text (`==text==`).
- There is custom logic in `docs/.vitepress/theme/` and a custom Vite plugin (`generate-articles-json`) that runs during the build process.

