# ISSUE 1 — Team EvL product page at `/teamevl`

**Issue:** https://github.com/studioinfinitelives/sil008/issues/1
**Status:** Planned

## Problem

`/habisloth` is the only product section on the site. Team EvL's `ProjectCard` in
`src/app/page.tsx:33-38` carries `externalUrl="https://linktr.ee/teamevl"` and sends visitors
off-site. Build `/teamevl` in the same shape as `/habisloth`, populated from the copy Team EvL
already publishes, and repoint the card at it.

The page is intended to **replace** the Linktree (the Linktree will later point only here), so
it must carry all six of that page's destinations, not just a store link.

## Decisions (settled with the user — do not re-litigate)

- **Full art layout with written stand-ins.** Six `FeatureRow`s built against `evl_*` CDN
  filenames that do not exist yet, each falling back to a written stand-in. Chosen over a
  text-only layout so the page is finished the moment art is uploaded. **It ships as six
  outlined boxes today — that is expected, not a bug.**
- **Its own section palette.** New `[data-section="teamevl"]` light + dark blocks in
  `globals.css`, transcribed from `site_card_teamevl.png`. Exact values and verified contrast
  ratios are in §1 — use them, do not re-pick colours.
- **Primary CTA is "Buy Team EvL"** → `https://www.thegamecrafter.com/games/team-evl`, matching
  the Linktree's top button. The user was told that listing currently returns _"not for sale …
  marked private by its designer"_ and chose it anyway. Do not silently swap it.
- Hero art is the **existing** `cardArt.teamevl`, not a stand-in — it is the one Team EvL asset
  that is actually live, so the page is not 100% placeholder above the fold.

## Placement

**Everything below goes in this app.** `.claude/kanban.json` names `../sil_common` as
`sharedPackage`, but sil_common is a **Flutter/Dart** package (`pubspec.yaml`,
`analysis_options.yaml`, `lib/*.dart`) — no React/TypeScript can live there. The placement rule
is moot for this issue; there is no shared-package change and nothing to unstage there.

Within the app, two existing pieces move up out of `app/habisloth/_components/` into
`src/components/` because `/teamevl` needs them and importing across another route's private
`_components/` folder is not on. See §3 and §4. **Do not fork a second copy of either.**

## Key facts (verified)

- **The CDN has exactly one Team EvL file.** `sil006/web/cdn/` holds `site_card_teamevl.png`
  and nothing else Team EvL. There is no `evl_*` art. All six row images are missing on day one.
- **A missing CDN file returns `200 text/html`, not 404** — the Habi Sloth Hosting site serves a
  catch-all rewrite to the Flutter shell. This is why the stand-in must be a client-side
  `onError` handler and cannot be a build-time reachability check. The reasoning is already
  written out in `AppScreenshot.tsx:6-26`; preserve it when refactoring.
- `next.config.ts:17-24` `remotePatterns` already allow `sil006.web.app` and `sil006-dev.web.app`
  under `/cdn/**`. New `evl_*` filenames need **no** config change.
- `typedRoutes: true` (`next.config.ts:10`). Adding `/teamevl` to `SiteHeader`'s `NAV` or
  `sitemap.ts` **before** `app/teamevl/page.tsx` exists fails `tsc`. Create the page first.
- `output: "export"` — every `opengraph-image.tsx` needs `export const dynamic = "force-static"`.
- Route layouts type their props as `LayoutProps<"/route">` (Next 16.3.1 generated types), see
  `app/habisloth/layout.tsx:8-10`. Not `{ children }: { children: ReactNode }`.
- Tests here are **lib-only** (`src/lib/legal.test.ts`, `src/lib/habits.test.ts`). There is no
  component-test harness and no snapshot suite. See §14.
- Player count, play time and age range are **not publicly retrievable** — BGG returns 403 to
  crawlers and the Game Crafter listing is private. The page must not state them.

### Copy sources (all verbatim from public Team EvL material — invent nothing)

- "The UNcooperative card game of bluffing, social deduction, and general evil."
- "A social deduction and bluffing game to summon EvL back into a boring Utopian world."
- "Everyone works towards the same goal, but only the most EvL can win."
- "Using one action per turn, you must manipulate the Elements within the ritual circle in an
  effort to control the most information."
- "Your goal is to be the first to correctly Call the Ritual and summon the demon within."
- "Each [round] consists of a new summoning recipe depicted by the Ritual Card. Once you believe
  the elements around the card are in order, Call the Ritual."
- "Table talk is not only acceptable, it's EvL."
- "You may desire to coax your 'Team' into calling the ritual too soon."

## Edits, in order

### 1. `src/app/globals.css` — the Team EvL palette

Add a raw brand block after the `--color-habi-*` block inside `@theme`. Every value is sampled
from `site_card_teamevl.png`; keep the comment saying so, matching the provenance comments the
file already carries:

```css
/* Team EvL, sampled from site_card_teamevl.png. The game has no app, so this
   file is the source rather than a copy — unlike the habi-* block above. */
--color-evl-ritual: #3d2841; /* the ritual circle */
--color-evl-ritual-deep: #1b101f; /* its shadow */
--color-evl-violet: #543e56;
--color-evl-mist: #847082; /* ring highlight */
--color-evl-silver: #e2dde0; /* the wordmark */
--color-evl-gold: #d8b162; /* the gold element card */
--color-evl-blood: #94354b; /* the red element card */
```

Then two semantic blocks, placed after the two `habisloth` blocks so the file stays
studio → habisloth → teamevl. **Light** (canvas is inherited `#ffffff`, as habisloth does):

```css
[data-section="teamevl"] {
  --color-surface: #efe9f1;
  --color-surface-alt: #f5f1f6;
  --color-line: #d6cbd9;

  --color-ink: var(--color-evl-ritual); /* 13.31 on canvas */
  --color-subtle: #5f4a60; /* 7.97 */
  --color-link: var(--color-evl-blood); /* 7.32 */

  --color-brand: var(--color-evl-ritual);
  --color-brand-bright: var(--color-evl-gold);
  /* Unlike Habi Sloth's yellow, this brand is dark — so white is the on-colour. */
  --color-on-brand: #ffffff; /* 13.31 on brand */
  --color-on-brand-bright: var(--color-evl-ritual); /* 6.58 on the gold */
}
```

**Dark** — a violet-black rather than the studio's neutral one:

```css
.dark [data-section="teamevl"] {
  --color-canvas: #140e17;
  --color-surface: #201829;
  --color-surface-alt: #0d090f;
  --color-line: #3a2c40;

  --color-ink: #ece6ee; /* 15.49 */
  --color-subtle: #b3a4b8; /* 8.07 */
  --color-link: var(--color-evl-gold); /* 9.40 */

  --color-brand: var(--color-evl-gold);
  --color-brand-bright: #c9a6e0;
  --color-on-brand: #140e17; /* 9.40 on the gold */
  --color-on-brand-bright: #140e17; /* 9.06 */
}
```

All ratios above were computed against the block's own canvas and are already AA, most AAA —
mirror the existing blocks' comment style and do not re-derive them. `--color-evl-mist` is
4.54 on white: fills and rules only, never body text.

### 2. `src/lib/cdn.ts` — `evlArt`

Add after `habiArt`. Six names, using an `evl_` product namespace that parallels `habi_`:

```ts
/**
 * Team EvL's illustrations.
 *
 * These take an `evl_` product prefix rather than the `site_` one: the rule
 * above keeps site chrome clear of a product's namespace, and these are the
 * game's own art, not chrome. Unlike `habi_*` no app owns these names, so this
 * file is where they are coined.
 *
 * NONE OF THESE FILES EXIST YET. Every row renders its written stand-in until
 * the art is uploaded — see `EvlArt`. Because `/cdn/**` is immutable, replacing
 * one later means a new filename and a change here.
 */
export const evlArt = {
  circle: cdnUrl("evl_ritual_circle.png"),
  action: cdnUrl("evl_one_action.png"),
  recipe: cdnUrl("evl_ritual_card.png"),
  call: cdnUrl("evl_call_the_ritual.png"),
  talk: cdnUrl("evl_table_talk.png"),
  betray: cdnUrl("evl_too_soon.png"),
} as const;
```

Leave `cardArt.teamevl` exactly as it is — the hero uses it.

### 3. Move `FeatureRow` to `src/components/FeatureRow.tsx`

`git mv src/app/habisloth/_components/FeatureRow.tsx src/components/FeatureRow.tsx`.

It is already section-agnostic — pure layout on semantic tokens, no `habi` anything. Both
`FeatureRow` and `FeatureArt` move together, unchanged apart from the doc comment, which says
"the app's own CDN" and should now not read as Habi-specific.

Update the import in `src/app/habisloth/page.tsx:4` to `@/components/FeatureRow`. That is the
only importer — confirm with a grep before and after.

### 4. Extract `src/components/FallbackImage.tsx`

New client component holding the mechanism currently inside `AppScreenshot`: render `<Image>`,
and on `error` swap to a dashed box that holds the same aspect ratio.

```tsx
"use client";
// props: src, alt, width, height, fallback: string, className, fallbackClassName
```

**Move `AppScreenshot.tsx:6-26`'s doc comment here** — the explanation of _why_ a client
`onError` is the only workable signal belongs with the mechanism, not with one caller. Keep the
inline note at `AppScreenshot.tsx:46-47` about `aspectRatio` being a style rather than a class
(Tailwind cannot see class names built from props).

Then rewrite `src/app/habisloth/_components/AppScreenshot.tsx` as a thin wrapper: it keeps its
own `FALLBACK_TEXT` ("Picture a Beautiful wheel full of habits") and its phone styling
(`max-w-[320px] rounded-3xl shadow-xl`, dashed variant `rounded-3xl border-2 border-dashed`).
**The Habi Sloth page must render byte-identically after this refactor** — it is a pure
extraction, no visual change.

### 5. `src/app/teamevl/layout.tsx`

Straight parallel of `app/habisloth/layout.tsx`, scoping the palette to the subtree:

```tsx
export default function TeamEvlLayout({ children }: LayoutProps<"/teamevl">) {
  return <div data-section="teamevl">{children}</div>;
}
```

### 6. `src/app/teamevl/_components/EvlArt.tsx`

The row-media component: `FallbackImage` with `FeatureArt`'s styling
(`mx-auto h-auto w-full max-w-md`) and a per-row `fallback` string, since every row is missing
its art and each stand-in should describe its own picture. The dashed variant wants
`rounded-2xl` and the same `border-line border-2 border-dashed p-8 text-center` treatment.

It cannot reuse `FeatureArt` — that is a server component with no failure path, correct for
Habi Sloth where the art exists.

### 7. `src/app/teamevl/_components/TeamEvlLinks.tsx`

The Linktree's six destinations. Unlike `HabiSlothLinks` these are **all external**, so plain
`<a target="_blank" rel="noreferrer">`, not `<Link>`, and no `Route` typing. Keep the same
`border-line mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm` shell and
`aria-label="Team EvL links"`.

```ts
const LINKS = [
  {
    href: "https://www.thegamecrafter.com/games/team-evl",
    label: "Buy Online",
  },
  {
    href: "https://drive.google.com/file/d/1M8WmneO08aBMymqSRKmIgKT2fzRDn0LQ/view?usp=drive_link",
    label: "Current Rules (PDF)",
  },
  {
    href: "https://drive.google.com/drive/folders/1Uuk6u7_1tCTmNG4Ee6azhCprXI1jZB2g?usp=drive_link",
    label: "Rules Archive",
  },
  { href: "https://youtu.be/ecXGyscPgWw", label: "How To Play" },
  {
    href: "https://boardgamegeek.com/boardgame/228575/team-evl",
    label: "Leave a Review",
  },
  { href: "https://discord.gg/zrSg2CfKGS", label: "Discord" },
] as const;
```

These are transcribed from the live Linktree — do not "tidy" the Drive URLs, the query strings
are part of the share links.

### 8. `src/app/teamevl/page.tsx`

Same skeleton as `app/habisloth/page.tsx`: hero `<section>`, a `max-w-6xl` div of `FeatureRow`s,
a `bg-surface-alt` closing band, then the links.

- `DESCRIPTION` = "The UNcooperative card game of bluffing, social deduction, and general evil."
- `BUY_URL` = `"https://www.thegamecrafter.com/games/team-evl"`.
- `metadata`: title "Team EvL", `alternates.canonical: "/teamevl"`, and the `openGraph` override
  block exactly as habisloth does it (title/description/url — the image is picked up from the
  segment automatically).
- Hero: badge "Team EvL"; `h1` "The UNcooperative card game."; lede "Bluffing, social deduction,
  and general evil — summon EvL back into a boring Utopian world."; a `Button asChild size="lg"`
  reading **Buy Team EvL** → `BUY_URL`; then `cardArt.teamevl` at `width={240} height={240}`,
  `priority`, capped `max-w-xs` (it is square, not the wide 1272×706 habi hero art — do not
  reuse `max-w-lg`).
- Six rows, alternating (`mediaLeft` on rows 2, 4, 6), each with an `EvlArt` and a stand-in line:

  1. **"Everyone wants the same thing."** — Same goal, same table, same ritual. Only the most
     EvL of you actually wins it. _(This row is the page's argument; it comes first, the way the
     wheel row does on Habi Sloth.)_
  2. **"One action. That's your turn."** — Move an Element in the ritual circle and nothing else.
     What you are really buying is information, and more of it than anyone else has.
  3. **"A new recipe every round."** — The Ritual Card names what the summoning needs. Read the
     circle against it and work out what is still out of place.
  4. **"Call the Ritual."** — Think the Elements are in order? Say so. Get it right and the demon
     arrives; get it wrong in front of everyone and you have just told the table what you know.
  5. **"Table talk is EvL."** — Talking is not a leak, it is the game. Lie, bargain, and read the
     pauses.
  6. **"Let them call it early."** — Nudge your "Team" into summoning too soon. Their mistake is
     your information.

- Closing band: `h2` "Only the most EvL can win." + the Buy button again, same classes as
  `habisloth/page.tsx:180-191`.
- `<TeamEvlLinks />` in a `mx-auto max-w-6xl px-5 pb-6` div. **No `omit` prop** — these are
  external links, none of them is this page.

Write a file-level doc comment in the house style explaining the layout and, explicitly, that
every row currently renders its stand-in because no `evl_*` art exists yet.

### 9. `src/lib/og.tsx` — `teamEvlPalette`

Add beside `habiSlothPalette`. Satori gets inline hex only, so these are duplicated from §1 by
necessity — the file already says so at lines 10-12:

```ts
export const teamEvlPalette: OgPalette = {
  background: "#140e17",
  accent: "#d8b162",
  title: "#ece6ee",
  tagline: "#b3a4b8",
  eyebrow: "#d8b162",
};
```

### 10. `src/app/teamevl/opengraph-image.tsx`

Parallel of the habisloth one, including `export const dynamic = "force-static"`.
`alt` = "Team EvL — the UNcooperative card game of bluffing and social deduction".
`eyebrow` "Team EvL", `title` "The UNcooperative Card Game.", `tagline` "Bluffing, social
deduction, and general evil.", `palette` `teamEvlPalette`.

### 11. `src/app/sitemap.ts`

Add `{ path: "/teamevl", changeFrequency: "monthly", priority: 0.9 }` directly after the
`/habisloth` entry — same priority, they are peers.

### 12. `src/components/SiteHeader.tsx`

Insert `{ href: "/teamevl", label: "Team EvL" }` into `NAV` **before** the Habi Sloth entry
(alphabetical is not the point — it matches the hub's card order, Team EvL first).

### 13. `src/app/page.tsx`

The Team EvL `ProjectCard`: replace `externalUrl="https://linktr.ee/teamevl"` with
`to="/teamevl"`. `ProjectCardProps`' `?: never` arms mean passing both fails `tsc`, so this is
a swap, not an addition. Keep `subtitle="The Card Game"`.

### 14. Tests

There is no component-test harness in this repo and `src/lib/cdn.ts` has no existing test, so
**no new test file** — inventing a suite here would not match the codebase.

`make check` is the gate, and it is a real one for this change:

- `typecheck` catches a bad `to`/`href` (typedRoutes), a wrong `LayoutProps<>` route string,
  and the `ProjectCard` never-arms.
- `lint` + `format-check` cover the rest.
- `test` (vitest) must stay green — nothing here touches `legal.ts` or `habits.ts`, so a failure
  means the `FeatureRow`/`AppScreenshot` move broke an import.

Then verify by eye, both themes, at narrow and wide: `make serve`, visit `/teamevl`, confirm the
six stand-ins hold their row height and the palette is violet in light and violet-black in dark.
Also reload `/habisloth` and confirm §3/§4 changed nothing there.

## Gotchas that bite here

- **Do not stage, commit or push.** Everything stays unstaged.
- **`AGENTS.md`: this is Next 16.3.1 and not the Next in your training data.** Read the relevant
  guide under `node_modules/next/dist/docs/01-app/` before writing route files — `LayoutProps<>`,
  `typedRoutes` and the `opengraph-image` conventions here are all current-version APIs. That
  block in `AGENTS.md` is regenerated by `next dev`; if it reappears as an uncommitted change,
  leave it.
- **Order matters:** page → layout → then `sitemap.ts` / `SiteHeader` / `page.tsx`. `typedRoutes`
  generates route types from the filesystem, so referencing `/teamevl` before the route exists
  fails the build in a way that looks like a config problem and is not.
- The six stand-ins are the **expected** rendering, not a regression. Do not add art, do not
  substitute `habi_*` images to fill the rows, and do not quietly drop rows to hide the gap.
- The Buy button points at a listing currently marked private/not-for-sale. That is the user's
  call (see Decisions) — build it as specified and do not add a warning banner.
- `--color-brand` in this section is **dark**, the opposite of Habi Sloth's yellow. Anything that
  assumed a light brand with dark text on it (`bg-brand text-on-brand` in the hero badge and
  `PageShell`) is fine because it goes through `--color-on-brand`, but do not hardcode a text
  colour anywhere in the new page.
- `next/image` is unoptimized site-wide, so `width`/`height` on every image are load-bearing for
  layout stability — the stand-in derives its `aspectRatio` from the same two numbers, so a
  guessed ratio shifts the row when real art later arrives.
