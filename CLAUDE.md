# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal knowledge base blog built with VitePress, featuring markdown-based content management, automatic sidebar generation, article categorization, and view tracking.

## Common Commands

### Development
```bash
yarn dev          # Start development server (opens browser automatically)
yarn build        # Build for production
yarn preview      # Preview production build on port 8082
```

### Dependencies
```bash
yarn install      # Install all dependencies
```

## Architecture

### VitePress Configuration (`docs/.vitepress/config.mts`)

- **Auto-sidebar**: Uses `vite-plugin-vitepress-auto-sidebar` to automatically generate sidebars from directory structure
  - Folders are sorted before files
  - File/folder names starting with `0-` are pinned at the top
  - Numeric prefixes (e.g., `123-`) are removed from display names
  - Index files are ignored in sidebar
  - Image folders are excluded

- **Markdown plugins**:
  - `markdown-it-task-lists`: Task list checkboxes
  - `markdown-it-mark`: `==highlight==` syntax support

- **Theme**: Uses Catppuccin themes (latte for light, macchiato for dark)

- **Build-time hooks**:
  - `generateArticlesSummaryJSON()` runs at build start to generate article summaries

### Theme System (`docs/.vitepress/theme/`)

The theme extends VitePress's default theme with custom functionality:

**Custom Components**:
- `Category.vue`: Article listing component with infinite scroll and view counts
- `ConvertWordComponent.vue`: Word conversion tool
- `AudioLyricPlayer.vue`: Audio player with lyrics
- `SelectWordComponent.vue`: Word selection utility

**Article Summary System** (`custom/generateSummary.ts`):
- Scans all markdown files at build time
- Generates `docs/public/articles.js` containing article summaries (first 200 chars)
- Cleans frontmatter, images, URLs, markdown syntax from summaries
- Used by `Category.vue` for article previews

**Runtime Features** (`theme/index.ts`):
- **Last Updated Time**: Displays Git commit timestamp below H1 headers
- **View Tracking**: Records and displays page view counts (via `function.ts`)
- **Image Zoom**: Uses `medium-zoom` for image enlargement
- **Responsive Sidebar**: Hides table of contents when only H1 exists
- **Giscus Comments**: GitHub Discussions-based comment system
  - Repo: `xrz-baizer/vitepress-blog-baizer`
  - Category: Announcements

### Content Structure

Content is organized in three main directories under `docs/`:
- `00-TechnicalFile/`: Technical articles
- `01-Essay/`: Personal essays
- `02-Other/`: Other content (mainly English learning materials)

Each category has an `index.md` that uses the `<category/>` component to display article listings.

### Navigation and Sidebar Behavior

- Navigation is configured in `config.mts` with three top-level links
- Frontmatter can disable sidebar with `sidebar: false`
- Default behavior: sidebar is hidden on non-index pages (set via `transformPageData`)
- Auto-sidebar generates hierarchical navigation from folder structure

### Category Component Details

The `Category.vue` component implements:
- **Infinite scroll**: Loads 8 articles at a time when scrolling past middle of page
- **View counts**: Fetched asynchronously (disabled on mobile for performance)
- **Article summaries**: Loaded from pre-generated `articles.js`
- **Pinned articles**: Files starting with `0-` show "Pinned" badge
- **Responsive design**: Simplified layout on mobile (≤768px width)

## Important Notes

- Git status shows modified `docs/public/articles.js` - this file is auto-generated at build time
- Dark mode is disabled (`appearance: false` in config)
- Site uses Chinese ICP registration (粤ICP备2024352756号)
- Production site: https://baizer.info
- Sitemap is generated for SEO
