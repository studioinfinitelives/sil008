# ISSUE 6 — Team EvL: spinning photo carousel of real games

**Issue:** https://github.com/studioinfinitelives/sil008/issues/6
**Status:** Planned

## Context

`/teamevl` closes with six alternating picture-and-text rows of product art, then a promo GIF and a
buy button. There is nothing on the page showing the game being _played_. Ten photographs of real
games were supplied; this issue puts them on the page as a 3D turntable carousel between the last
feature row and the closing band.

The motion is specified by a reference video (`~/Downloads/carousel.webm`, 6.84s, 1156×720). Frames
were extracted and read: it is **not** a stack or a slider. Cards are arranged around a **cylinder**
and the ring rotates about a **vertical axis** — the front card faces the viewer, the ones beside it
turn edge-on to a thin sliver, and one frame catches a card at exactly 90° as a one-pixel line. The
front card measures 235×318 in frame — **3:4**, which is the crop chosen for ours.

## Decisions (settled with the user — do not re-litigate)

- **3D turntable**, not a stack, not a horizontal scroller.
- **All ten photos cropped to 3:4 upright.** Four were shot landscape and lose width; accepted.
- **Plain rounded photo cards** — no white Polaroid frame. An earlier draft had one; it is out.
- **No backdrop disc.** The reference has a flat yellow circle behind the ring; ours does not.
- **Autoplay**: advance one photo per second for four seconds, then a **full 360° turn over one
  second**, then carry on forward from where it landed and repeat. A full turn returns to the same
  card, so successive cycles walk the whole list (1‑2‑3‑4, spin, 5‑6‑7‑8, spin, 9‑10‑1‑2, …).
- **Pause on hover, and click to hold.** Plus the pause button required by §"Autoplay" below.
- **Photos used as delivered** — not retouched, not checked for transparency, not yet on the CDN.
- Row copy sits **left**, carousel **right**: the row above it (`Small Package. Complex Strategies.`)
  is `mediaLeft`, and the page alternates.

## Placement

**Everything goes in this app.** `.claude/kanban.json` names `../sil_common` as `sharedPackage`, but
sil_common is a Flutter/Dart package — no TypeScript can live there. Same conclusion as ISSUE 1 and
ISSUE 4. Nothing to unstage there, no shared-package tests.

Within the app the component is Team EvL's alone (its own photos, its own page), so it belongs in
`src/app/teamevl/_components/` beside `EvlArt` and `EvlLinkDrawer` — not in `src/components/`, which
is for chrome shared across products.

## Key facts (verified)

- **The staged photos are already copied into `public/`** under `site_evl_photo_*.jpg`.
  `.gitignore:53` (`/public/site_*`) keeps them out of this public repo; `git status` is clean.
- **`site_evl_photo_livingroom.jpg` carries EXIF orientation 6.** Its raster is 4000×3000 but a
  browser draws it rotated, at **3000×4000**. The other nine have orientation 1 or no EXIF. Declare
  the _rendered_ size or that card reserves a box on its side.
- **`next/image` is `unoptimized`** (`next.config.ts:12`), so no `srcset` is emitted and a `sizes`
  attribute does nothing. Do not add one. What ships is byte-for-byte what is in `public/`.
- **All ten photos are in the DOM at once** — a ring needs every card — so none of them lazy-load in
  practice. Together they are **~30 MB**. See §"Before this ships".
- `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `verbatimModuleSyntax`
  (type-only imports need `import type`).
- Component tests exist and work: jsdom 28, `@testing-library/react`, `include:
["src/**/*.test.{ts,tsx}"]` (`vitest.config.mts`). `vitest.setup.ts` loads only jest-dom.
- **jsdom provides `window.matchMedia`, returning `matches: false`** — so a reduced-motion query
  reads as "no preference" in tests without a stub. Guard with `window.matchMedia?.(…)` anyway; it
  is also read during the static export, where there is no window at all.
- `lucide-react` is a dependency; `ChevronLeft`/`ChevronRight` are already used by `EvlLinkDrawer`.
- Semantic colour tokens available: `text-ink`, `text-subtle`, `border-line`, `bg-surface-alt`,
  `bg-canvas` (`src/app/globals.css:67-83`).

## The geometry

Ten cards evenly spaced around a cylinder, `SEG = 360 / 10 = 36°`.

For cards of width `W` to sit edge to edge around the ring, the radius is
`R = (W / 2) / tan(180° / N)`. For `N = 10`, `tan(18°) = 0.32492`, so **`R = W × 1.5388`** — a pure
constant, so it can be a `calc()` and needs no measurement or `ResizeObserver`.

- Card height `H = W × 4 / 3` (the 3:4 crop).
- Stage (perspective element): `perspective: 1100px`, `overflow: hidden`, height `H + 1.5rem`.
- Ring (inside the stage): `transform-style: preserve-3d`, transform
  `translateZ(calc(var(--deck-r) * -1)) rotateY(<angle>deg)`. The negative `translateZ` pulls the
  ring back so the front card lands on the perspective plane at its natural size.
- Card `i`: absolutely centred, transform `rotateY(<i × 36>deg) translateZ(var(--deck-r))`,
  `backface-visibility: hidden` so the far half of the ring disappears rather than showing mirrored.

**`overflow: hidden` goes on the stage, never on the ring.** An element with `overflow` other than
`visible` has its own `transform-style` forced to `flat`; the stage does not carry `preserve-3d`, so
clipping there is safe, and clipping on the ring would collapse the whole effect to 2D.

Widths via a CSS variable so one number drives everything:

```
--deck-w: 190px;                      /* base   */
sm:  --deck-w: 230px;
lg:  --deck-w: 260px;
--deck-r: calc(var(--deck-w) * 1.5388);
```

## Edits, in order

### 1. Delete `src/app/teamevl/_components/EvlPhotoDeck.tsx`

Written earlier in the session against the superseded brief (Polaroid frames, a flat stack, mixed
portrait and landscape). None of it survives the decisions above. Delete it rather than editing it.

### 2. `src/app/teamevl/_components/evlPhotos.ts` (new)

Pure data, no React — the list is the thing most likely to be reordered or extended, and keeping it
out of the component means the test can assert against it the way `EvlLinkDrawer.test.tsx` asserts
against `evlLinks`.

```ts
export interface EvlPhoto {
  src: string;
  alt: string;
  /** The photo's size AS A BROWSER DRAWS IT — see the EXIF note below. */
  width: number;
  height: number;
  /** `object-position` for the 3:4 crop. Omit for `center`. */
  focus?: string;
}
```

Carry a file-level doc comment covering: the TEMPORARY staging in `public/` and what finishing the
CDN swap involves; and the EXIF trap — that `livingroom` is stored 4000×3000 but drawn 3000×4000, so
these numbers are rendered sizes, not file sizes.

Entries, in this order (chosen so the shape and setting change from one card to the next):

| src (`/site_evl_photo_…`) | rendered      | alt                                                                                            |
| ------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `_convention.jpg`         | 4000×3000     | Three players leaning over a ritual circle at a convention table, the hall busy behind them    |
| `_box_gift.jpg`           | 1200×1600     | A player holding up the Team EvL box beside a Christmas tree                                   |
| `_livingroom.jpg`         | **3000×4000** | A game in progress around a long dining table, cards dealt out and a poster on the wall behind |
| `_kitchen_table.jpg`      | 2048×1152     | Five players crowded into a selfie mid-game, cards held up to the camera                       |
| `_window_pair.jpg`        | 3072×4080     | Two players facing off across a café table in the window, the circle laid out between them     |
| `_box_eye.jpg`            | 2208×2209     | A player holding the Team EvL box up over one eye, the ritual circle on the lid staring out    |
| `_patio.jpg`              | 3648×2736     | A group around an outdoor table on a sunny street, drinks and the game between them            |
| `_card_eyes.jpg`          | 1536×2048     | A player holding two Ritual Cards up in front of their eyes like spectacles                    |
| `_booth_four.jpg`         | 3072×4080     | Four players in a café booth, Element tokens spread across the table                           |
| `_box_face.jpg`           | 1152×2048     | A player pulling a face behind the Team EvL box held up to the camera                          |

Leave `focus` unset everywhere to begin with; it exists so a centre crop that cuts somebody's head
off can be nudged after looking at it, without touching the component.

### 3. `src/app/teamevl/_components/EvlPhotoCarousel.tsx` (new, `"use client"`)

**State.** One piece of motion state, because the transition duration has to change per beat and it
must change in the _same_ commit as the angle:

```ts
const [spin, setSpin] = useState({ step: 0, ms: 0 });
```

`step` is a **monotonically increasing integer**, never taken modulo — that is what lets a full turn
be `step + 10` and actually rotate rather than snap. The ring's angle is `-spin.step * 36`; the
photo at the front is `((spin.step % 10) + 10) % 10`.

Plus `paused: boolean` (click-to-hold), `hovered: boolean`, and a `reduced` flag read once on mount
from `window.matchMedia?.("(prefers-reduced-motion: reduce)")`, subscribing to its `change` event.

**The autoplay cycle.** A `setTimeout` chain, not `setInterval` — the beats are not all the same
length and the chain restarts cleanly after a pause. Hold the beat counter in a ref.

- Beats 0–3: `step + 1`, `ms: 600`, next timeout in **1000 ms**.
- Beat 4: `step + 10` (a full 360°), `ms: 1000`, next timeout in **1000 ms**, then the counter
  resets to 0.

Running is `!paused && !hovered && !reduced && document.visibilityState === "visible"`. Subscribe to
`visibilitychange` so a backgrounded tab is not spinning ten photos. Clear the timeout in every
effect cleanup.

**Manual stepping.** `step(dir: 1 | -1)` sets `{ step: spin.step + dir, ms: 500 }` and resets the
beat counter, so a hand-driven step does not land mid-cycle and immediately get overrun.

**Rendering.**

```
<section aria-roledescription="carousel" aria-label="Photos from real games of Team EvL">
  <div className="stage" onPointerEnter onPointerLeave onClick={togglePaused}>
    <div className="ring" style={{ transform, transitionDuration }}>
      {evlPhotos.map(...)}          // <figure> per card
    </div>
  </div>
  <controls>  ‹  ·  N of 10  ·  pause/play  ·  ›  </controls>
</section>
```

Each card is a `<figure>` carrying `inert` and `aria-hidden` unless it is the front one — the same
device `EvlLinkDrawer` uses for its closed panel, and the reason a screen reader is not read ten
photographs it cannot see. Inside it, a `next/image` with
`className="h-full w-full object-cover"`, the wrapper sized from `--deck-w` and
`rounded-2xl overflow-hidden shadow-[0_12px_30px_-10px_rgb(0_0_0/0.45)]`.

The click-to-hold handler is on the stage. Put `data-analytics="off"` on it — `describeClickTarget`
would otherwise report a `button_click` every time somebody pauses the carousel.

**Reduced motion**: no autoplay at all, and `ms: 0` on every transition so arrow presses cut rather
than sweep. Do not merely slow it down.

**Optional polish**: `filter: blur(2px)` on the ring while the fast beat is in flight, cleared when
it lands. It sells the turn. Skip it entirely when `reduced`.

### 4. Autoplay needs a real pause control

**WCAG 2.2.2 (Pause, Stop, Hide)** applies: this moves automatically, for longer than five seconds,
beside text. Hover and click are not enough — neither is reachable by a keyboard or a screen-reader
user. Ship a visible **pause/play toggle button** in the control row alongside the arrows, with its
`aria-label` flipping between "Pause the carousel" and "Play the carousel". This is a requirement,
not a nicety; do not drop it to save space.

Related: the "N of 10" readout takes `aria-live="polite"` **only while paused or manually driven**,
and `aria-live="off"` while autoplaying — a live region announcing a new photo every second is
unusable.

### 5. `src/app/teamevl/page.tsx`

Insert one `FeatureRow` **after the closing `</div>` of the `max-w-6xl` wrapper (line ~399) and
before the `<section className="bg-surface-alt …">`**. No `mediaLeft` — the row above it has it, and
the page alternates.

```tsx
<FeatureRow title="Played by real people." media={<EvlPhotoCarousel />}>
  <p>
    Kitchen tables, café booths, convention halls, one patio in the sun. Every
    photo here is somebody’s game night.
  </p>
</FeatureRow>
```

Copy is a proposal — it is the author's to change, and nothing else depends on the wording.

Two comments in this file go stale and must be fixed in the same commit:

- `EvlLinkDrawer`'s comment at line ~176 says it is **"The only client component on the page."** It
  is not any more.
- The file's top doc comment describes the page as rows then a call to action then the links; add
  the carousel row to that description.

### 6. `src/app/teamevl/_components/EvlPhotoCarousel.test.tsx` (new)

Style it on `EvlLinkDrawer.test.tsx`: assert the contract, not the Tailwind. Use
`vi.useFakeTimers()` with `advanceTimersByTime`, and `userEvent.setup({ advanceTimers })` so the two
clocks agree.

- Renders one figure per entry in `evlPhotos`, each with a non-empty `alt`.
- Exactly one figure lacks `inert`, and it is the first photo.
- Next steps forward; ten presses return to the first photo.
- Previous from the first photo lands on the last.
- Autoplay: four 1000 ms ticks advance the readout by one each time; the fifth leaves the readout
  **unchanged** (a full turn) and the sixth resumes stepping. This is the test that pins the cycle.
- The pause button stops the advance and its accessible name flips.
- `pointerEnter` on the stage stops the advance; `pointerLeave` resumes it.
- The readout reads "1 of 10" initially.

**Do not assert the `transform` string.** What the carousel does is its contract; the angle it does
it at is a fact about the stylesheet, and pinning it makes every tweak a test edit — the reasoning
already written at the top of `EvlLinkDrawer.test.tsx`.

## Before this ships

The ten photos are staged at full camera resolution — **~30 MB together**, and every one of them is
in the DOM on page load. With `unoptimized: true` that is exactly what a visitor downloads. This is
fine on `sil008-dev.web.app` for review and **must not reach production**.

Finishing the job is a separate pass, deliberately not in this issue: downscale each to ~800 px on
the long edge, upload under `evl_photo_*` names, add them to `src/lib/cdn.ts` beside `evlArt`, point
`evlPhotos` at the constants, and delete the staged copies. `/cdn/**` is served immutable for a
year, so those are one-shot filenames.

## Verification

`make check` (typecheck, lint, format-check, test) is the gate.

Then `make serve` and, on `/teamevl`:

- Watch a full cycle: four one-second beats, then a one-second full turn, then it continues forward
  from there. Over three cycles every photo should have had a turn at the front.
- Confirm the side cards go edge-on and the back half of the ring is not visible mirrored — if it
  is, `backface-visibility` is missing.
- Hover pauses; moving away resumes. Click holds; click again releases.
- Tab to the controls: arrows step it, the pause button stops it, and the readout is announced when
  paused but not while it is running.
- Turn on Reduce Motion in System Settings and reload: nothing moves on its own, arrows still work.
- Both themes, phone width and desktop. The stage must clip the ring rather than widen the row —
  a horizontal scrollbar on the page means `overflow: hidden` is on the wrong element.
- Switch to another tab for a few seconds and back; it should not have raced ahead.

## Gotchas that bite here

- **Do not stage, commit or push.** Everything stays unstaged.
- **`AGENTS.md`: this is Next 16.3.1, not the Next in your training data.** Read
  `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` before touching
  `next/image`. Note `priority` is deprecated in Next 16 in favour of `preload` — the hero on this
  page still uses `priority`; leave it, it is not this issue's job. That `AGENTS.md` block is
  regenerated by `next dev`; if it reappears as an uncommitted change, leave it.
- **`overflow: hidden` on the ring flattens the 3D.** It goes on the stage. This is the single
  easiest way to spend an hour wondering why the carousel is a pile of stacked rectangles.
- **`step` must not be taken modulo.** Wrapping it turns the full turn into a no-op and every
  wrap-around into a backwards snap.
- **Declare `livingroom` as 3000×4000**, not 4000×3000. EXIF orientation 6.
- **Do not add a `sizes` prop.** Images are unoptimized; there is no srcset for it to drive.
- **The pause button is required**, per §4. Hover-only pause fails WCAG 2.2.2.
- **`data-analytics="off"` on the stage**, or every pause click is reported as a button click.
- The photos are of identifiable people. The alt text describes what is happening, not who — keep
  it that way, and do not add names.
