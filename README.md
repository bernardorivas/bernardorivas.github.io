# bernardorivas.com

This repository contains the source for [Bernardo Rivas's academic website](https://bernardorivas.com). The site presents research, teaching, software, and talks.

## Working locally

```bash
npm ci
npm run dev      # http://localhost:3000
npm run verify
```

Run `npm run verify` before committing. It builds the static site and checks its tests, links, redirects, and assets.

## Publishing

Pushing to `main` deploys the site through GitHub Pages.
