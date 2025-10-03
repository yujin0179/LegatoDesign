# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a design portfolio website built with Astro, adapted from a photography portfolio template. It showcases design work through collections and galleries. The project uses TypeScript, TailwindCSS, and includes automated deployment to GitHub Pages.

## Essential Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Quality & Testing
```bash
npm run lint         # Run ESLint on .ts, .js, .astro files
npm run prettier     # Format all files with Prettier
npm test             # Run Vitest tests
```

### Gallery Management
```bash
npm run generate     # Generate gallery.yaml from design work images in src/gallery/
                     # Usage: npm run generate (operates on src/gallery)
```

## Architecture & Key Concepts

### Gallery System Architecture

The gallery system is the core of this portfolio, built around a YAML-based configuration that connects design work images to collections:

1. **Image Storage**: Design work images are stored in `src/gallery/<collection-name>/` directories
2. **Gallery Configuration**: `src/gallery/gallery.yaml` defines collections and image metadata
3. **Image Processing**: Images are loaded via Vite's `import.meta.glob` and processed through:
   - `galleryData.ts` - Data types and YAML loading
   - `imageStore.ts` - Image retrieval, filtering, sorting, and validation
   - `galleryEntityFactory.ts` - Creates gallery entities from filesystem

### Collections System

- **Collections** are defined in `gallery.yaml` with `id` and `name`
- **Built-in collection**: `featured` is a special collection that doesn't need to be defined
- Each image can belong to multiple collections
- Collection pages are dynamically generated using `[...collection].astro`
- Images reference collections via the `collections` array in their metadata

### Image Metadata Structure

Images in `gallery.yaml` have three parts:
- `path`: Relative path from `src/gallery/`
- `meta`: Title, description, and collections array
- `exif`: Optional EXIF data (inherited from photography template - focalLength, iso, fNumber, shutterSpeed, captureDate, model, lensModel)

### Gallery Generator

The `gallery-generator.ts` script:
- Scans `src/gallery/` for image files
- Extracts EXIF data from images
- Merges with existing `gallery.yaml` (preserves manual edits)
- Creates collections based on directory structure
- Updates EXIF data while preserving metadata

### Component Structure

- `MainLayout.astro` - Base layout with navigation and footer
- `NavBar.astro` - Main navigation with collection links
- `PhotoGrid.astro` - Masonry grid layout for images using justified-layout
- `FeaturedGallery.astro` - Featured collection display
- `FeaturedWorkScroll.astro` - Horizontal scrolling showcase
- Two landing hero variants: `LandingHero-1.astro` and `LandingHero-2.astro`

### Site Configuration

- `site.config.mts` - Site metadata (title, owner, favicon, profile image, social links)
- `astro.config.mts` - Astro configuration (site URL, base path for GitHub Pages)
- TailwindCSS configuration includes custom color system using CSS variables

### Image Handling

- Astro's built-in image optimization is used
- Supported formats: jpg, jpeg, png, gif
- GLightbox provides responsive lightbox functionality
- Images are eagerly loaded via `import.meta.glob` for optimal build performance

## Pre-commit Hooks

The project uses pre-commit hooks (`.pre-commit-config.yaml`):
- Trailing whitespace removal
- End-of-file fixer
- YAML validation
- Large file checks (excludes `src/gallery/*`)
- Prettier formatting
- ESLint linting

## Testing

Tests are located in `src/data/__tests__/` and use Vitest. Focus areas:
- Gallery data loading and parsing
- Image store validation and filtering
- Collection management
- Gallery generator logic

## Deployment

GitHub Actions workflows in `.github/workflows/`:
- `test.yml` - Build and test verification
- `quality.yml` - Pre-commit checks
- `deploy.yml` - Automated deployment to GitHub Pages

Update `astro.config.mts` with your GitHub Pages configuration before deployment.
