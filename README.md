# infinitelives.io

The Studio Infinite Lives website — the studio hub plus the Habi Sloth product
section. Next.js App Router, TypeScript, Tailwind v4, statically exported and
served from Firebase Hosting.

## Getting started

Node 24 (see `.nvmrc`; `nvm use` picks it up).

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                            | What it does              |
| --------------------------------- | ------------------------- |
| `npm run dev`                     | Development server        |
| `npm run build`                   | Static export into `out/` |
| `npm run typecheck`               | `tsc --noEmit`            |
| `npm run lint`                    | ESLint                    |
| `npm run test` / `test:run`       | Vitest, watch / once      |
| `npm run format` / `format:check` | Prettier                  |

## Architecture

```
src/
  app/                      routes; _components/ folders hold route-owned UI
    _components/            hub-only components
    habisloth/              product section, brand-scoped via data-section
      _components/          Habi Sloth-only components
    opengraph-image.tsx     link-preview cards, rendered at build time
    sitemap.ts  robots.ts
  components/               UI shared across route subtrees
    ui/                     shadcn/ui primitives
  lib/                      site constants, CDN URLs, ported habit maths
```

A component used by one route subtree lives in that route's `_components/`; one
used by two or more lives in `src/components/`.

### Static export

`output: "export"` in `next.config.ts` means the whole site is plain files, so
there is **no ISR, no request-time route handlers, no proxy/middleware, and no
image optimizer** (`images.unoptimized` is on as a result). Two consequences
worth knowing before adding anything:

- Every dynamic route needs `generateStaticParams`.
- Every metadata route handler — `sitemap.ts`, `robots.ts`, and both
  `opengraph-image.tsx` files — must export `const dynamic = "force-static"`.
  Without it the build fails rather than quietly skipping the file.

### Styling

`src/app/globals.css` defines three token layers: raw brand palettes, the
semantic tokens components consume (`bg-canvas`, `text-ink`, `bg-brand`), and a
bridge mapping shadcn's primitives onto those. Section (`[data-section]`) and
theme (`.dark`) re-point the same custom properties, so identical markup
restyles wholesale — no component knows which brand it renders under.

### Artwork

Illustrations are hotlinked from the CDN via `src/lib/cdn.ts`, which is served
immutable for a year — **a file there can never be updated in place**, so new
art means a new filename.

The one exception is the studio mark: browsers require site icons on the site's
own origin, so `src/app/icon.svg` is committed, along with `favicon.ico` and
`apple-icon.png` rasterised from it. All three are © Studio Infinite Lives and
outside this repo's MIT licence — see [LICENSE](LICENSE). The vector master
lives on Google Drive, not here; to regenerate the rasters, render `icon.svg` at
512px and downscale (16/32/48 into the `.ico`, 180 opaque-backgrounded for
Apple — iOS composites transparency onto black).

## Deploying

```bash
npm run build
firebase hosting:channel:deploy preview   # always preview before production
```

Click through every route on the preview URL before touching DNS: `cleanUrls`
in `firebase.json` versus Next's `trailingSlash` is a known Firebase footgun.

## Licence

Code is MIT. Product names, logos and artwork are © Studio Infinite Lives, LLC
and are **not** licensed — see [LICENSE](LICENSE).
