# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Academic website for Bernardo Rivas built with Hugo and the Academic CV template from HugoBlox. The site is deployed via GitHub Pages and showcases research, publications, teaching, talks, and projects.

## Build and Development

**Build the site locally:**
```bash
hugo server
```

**Build for production:**
```bash
hugo --minify
```

**Clean build with garbage collection:**
```bash
hugo --gc --minify
```

The built site outputs to `public/` directory.

## Deployment

The site uses GitHub Actions for deployment (`.github/workflows/publish.yaml`):
- Triggered on push to `main` branch
- Uses Hugo version 0.136.5
- Builds with `hugo --minify`
- Generates search index with `npx pagefind --site "public"`
- Deploys to GitHub Pages

Alternative Netlify deployment configuration is in `netlify.toml` with similar build commands.

## Configuration Files

**Hugo configuration** (`config/_default/`):
- `hugo.yaml` - Main Hugo settings, baseURL, build options
- `params.yaml` - Site appearance, SEO, header/footer, features (math enabled)
- `menus.yaml` - Navigation menu structure
- `module.yaml` - Hugo module imports
- `languages.yaml` - Language settings

**Version lock:**
- Hugo version is pinned to 0.136.5 in `hugoblox.yaml`, `netlify.toml`, and GitHub Actions workflow

## Content Structure

All content is in `content/` directory organized by type:

- `authors/admin/` - Main author profile (`_index.md` contains biographical info, education, work history, interests)
- `publication/` - Research papers and preprints
- `talks/` - Conference and seminar presentations
- `teaching/` - Courses taught (TA roles and instructor positions)
- `project/` - Research projects (e.g., CMGDB, DSGRN)
- `activities/` - Professional activities

Each content item is typically an `index.md` file within its own directory.

## Customizations

**Custom layouts** (`layouts/partials/hooks/`):
- `biography-end.html` - Additional content appended to biography
- `head-end/github-button.html` - GitHub button in header

**Assets:**
- `assets/media/` - Images, icons, and media files
- `assets/scss/` - Custom styles

## Content Management

**Adding new publications:**
Create a new directory under `content/publication/` with an `index.md` file containing frontmatter for title, authors, date, publication type, abstract, etc.

**Adding talks:**
Create a new directory under `content/talks/` with an `index.md` file containing event details, date, location, and abstract.

**Adding teaching entries:**
Create a new directory under `content/teaching/` with an `index.md` file containing course details, semester, institution, and role.

**Updating CV:**
Replace `static/uploads/resume.pdf` with the updated PDF file.

## Theme

Uses HugoBlox Academic CV theme (formerly Wowchemy) loaded as a Hugo module. Theme documentation: https://docs.hugoblox.com/
