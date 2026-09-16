# infinitelives.io

The Studio Infinite Lives website — the studio hub plus the Habi Sloth and Team
EvL product sections. Next.js App Router, TypeScript, Tailwind v4, statically
exported and served from Firebase Hosting.

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
    teamevl/                product section, brand-scoped via data-section
      _components/          Team EvL-only components
    opengraph-image.tsx     link-preview cards, rendered at build time
    sitemap.ts  robots.ts
  components/               UI shared across route subtrees
    ui/                     shadcn/ui primitives
  content/legal/            committed fallback copies of the legal documents
  lib/                      site constants, CDN URLs, ported habit maths
cdn/                        artwork, gitignored, published by `make deploy-cdn`
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

Illustrations are served from the studio's own CDN host and named in
`src/lib/cdn.ts`. The files themselves are kept in a local `cdn/`, published by
`make deploy-cdn` independently of the site. **`cdn/` is gitignored and must
never be committed** — this repo is public and the art is not MIT-licensed — so
a fresh clone has none, and the art checks in `cdn.test.ts` skip without it.
That host is served immutable for a year — **a file there can never be updated
in place**, so new art means a new filename and a changed constant.

A Hosting deploy deletes every live file absent from the folder it publishes,
so `cdn/` must be complete before `make deploy-cdn`. The target refuses to run
unless every file `src/lib/cdn.ts` declares is present.

The one exception is the studio mark: browsers require site icons on the site's
own origin, so `src/app/icon.svg` is committed, along with `favicon.ico` and
`apple-icon.png` rasterised from it. All three are © Studio Infinite Lives and
outside this repo's MIT licence — see [LICENSE](LICENSE). The vector master
lives on Google Drive, not here; to regenerate the rasters, render `icon.svg` at
512px and downscale (16/32/48 into the `.ico`, 180 opaque-backgrounded for
Apple — iOS composites transparency onto black).

## Deploying

Everything goes through the `Makefile`, which mirrors `../sil006/Makefile`.

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `make check`        | typecheck, lint, format check, tests          |
| `make dev`          | build + deploy → <https://sil008-dev.web.app> |
| `make prod`         | build + deploy → <https://sil008.web.app>     |
| `make preview-prod` | production build on a 7-day preview channel   |
| `make deploy-cdn`   | publish `cdn/` artwork, no site build         |

Both Hosting sites live in the one `sil008` Firebase project (see `.firebaserc`,
which maps the `dev` and `prod` deploy targets onto them). The dev site is
served `X-Robots-Tag: noindex`, because it serves the same `robots.txt` and the
same `infinitelives.io` canonical URLs as production.

There is no build-time flavor. Every build points at the one studio art host, so
a dev export and a production export are byte-identical and differ only in which
site they land on. The dev site's `noindex` is a Hosting header rather than a
build flag, which is why the two exports can be the same bytes.

One thing the Makefile handles that a hand-run `npm run build` does not: **`out/`
is removed before every build.** Next does not purge the export directory, so a
file dropped from the site otherwise keeps shipping from a stale build.

Click through every route on `make preview-prod` before touching DNS:
`cleanUrls` in `firebase.json` versus Next's `trailingSlash` is a known Firebase
footgun.

## Licence

Code is MIT. Product names, logos and artwork are © Studio Infinite Lives, LLC
and are **not** licensed — see [LICENSE](LICENSE).
