# ISSUE 4 — Google Analytics with opt-in cookie consent

**Issue:** https://github.com/studioinfinitelives/sil008/issues/4
**Status:** Planned

## Problem

The site has no analytics and no cookie banner. Add GA4, gated behind an explicit opt-in, and
capture every `<a>` and `<button>` click as a GA4 event. The consent model, storage shape and
banner copy mirror the Habi Sloth web app, which already ships this
(`sil_common/lib/utils/cookie_consent.dart`, `sil_common/lib/services/web/cookie_consent_service.dart`,
`sil_common/lib/elements/cookie_consent_banner.dart`, `sil006/web/index.html` lines 47-64).

## Decisions (settled with the user — do not re-litigate)

- **Strict opt-in.** No gtag.js, no `dataLayer`, no cookie until the visitor accepts. Refusing is
  exactly as easy as accepting — equal visual weight, no dark patterns.
- **Mirror the app's banner exactly**: bottom-anchored, three actions (`Customize` /
  `Essential only` / `Accept all`), plus a Cookie Preferences dialog with a locked-on Essential row
  and one Analytics toggle. Same stored JSON shape and `version` field.
- **Delegated auto-capture**, not per-element instrumentation. One capture-phase listener; existing
  components are not converted to client components. `data-analytics-id` overrides the derived
  label where two buttons would otherwise be indistinguishable.
- **A new studio privacy notice at `/privacy`**, linked from the banner and the footer. Do **not**
  point the banner at `/habisloth/privacy` — that governs the app, and `SiteFooter.tsx:5-11` says
  in as many words that one product's terms must not appear to govern another's.
- **The measurement ID is `G-F1R5Z95KM1`** — read out of the project with
  `firebase apps:sdkconfig WEB 1:577778616879:web:22d5b6770bcd0414fb14da`. It is the `G-` form of GA
  property `550710966` / data stream `15463222007`, created when the web app was registered in the
  `sil008` Firebase project. Ship it as a committed constant.
- **The site does not use the Firebase SDK.** That `sdkconfig` call also prints `apiKey`,
  `authDomain` and friends; none of it is used here and none of it goes in the repo. A GA4 web data
  stream works with plain gtag.js regardless of having been created through Firebase.
- **No advertising signals, ever.** `ad_storage`, `ad_user_data`, `ad_personalization` stay
  `denied` unconditionally.

## Placement

**Everything goes in this app.** `.claude/kanban.json` names `../sil_common` as `sharedPackage`,
but sil_common is a **Flutter/Dart** package (`pubspec.yaml`, `lib/*.dart`) — no TypeScript can
live there. Nothing to unstage there, no shared-package tests. Same conclusion as ISSUE 1.

The Dart files above are a **reference to port from, not code to import**. Read them; do not try to
share them.

## Key facts (verified)

- `output: "export"` (`next.config.ts:6`). No route handlers, no middleware, no server-side consent
  cookie. Everything here is client-side.
- Firebase Hosting serves `out/` with `cleanUrls: true` (`firebase.json`), so page URLs carry no
  `.html`. `page_location` must come from `window.location.href`.
- Dev and prod exports are **byte-identical** by design (`Makefile:6-11`). A committed
  `GA_MEASUREMENT_ID` therefore means `sil008-dev.web.app` reports into the same property. The user
  accepted this; do **not** add a hostname gate or a build-time env var.
- **`gtag('config')` fires exactly one `page_view`, on load.** Next's client router does not fire
  another. Without an explicit per-route `page_view`, only landing pages are ever counted.
- **Consent Mode `analytics_storage: denied` does not stop gtag.js sending pings** — it sends
  cookieless ones. The documented full kill switch is `window['ga-disable-<ID>'] = true`. Both are
  needed on withdrawal.
- **`lib/legal.ts` cannot load a studio-owned document as it stands.** `loadLegalDocument`
  (`src/lib/legal.ts:240-269`) fetches from `habisloth.app` and asserts `LEGAL_VERSION`. The
  _parser_ is reusable; the _loader_ is not. See §7.
- **The legal parser rejects markdown links** (`src/lib/legal.ts:97-101`), numbered lists, `###`+
  headings, tables, block quotes and code fences (`src/lib/legal.ts:84-90`). The new privacy
  markdown must use none of them — URLs and email addresses go in as bare text.
- There **is** a component-test harness: jsdom, `@testing-library/react`, `@vitejs/plugin-react`,
  and `include: ["src/**/*.test.{ts,tsx}"]` (`vitest.config.mts`). The note in
  `plans/completed/ISSUE_1_TEAMEVL_PAGE.md` §14 saying otherwise is stale.
- jsdom 28 implements `HTMLDialogElement.showModal()`, so a native `<dialog>` is testable here.
  There is no shadcn `dialog.tsx` in `src/components/ui/` — only `button.tsx` and
  `dropdown-menu.tsx`. Do not run `shadcn add`.
- `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax` (type-only imports need `import type`).
- `typedRoutes: true`. `/privacy` cannot be referenced from `SiteFooter` or `sitemap.ts` until
  `app/privacy/page.tsx` exists. **Create the page first.**
- The app's stored key is `flutter.cookie_consent` (SharedPreferences prefixes it) on
  `habisloth.app`. This site uses a bare `cookie_consent` on `infinitelives.io`. Different origins,
  so nothing is shared either way — the shape is mirrored for consistent _behaviour_, not interop.

## Edits, in order

### 1. `src/lib/site.ts` — the measurement ID

Append after `CONTACT_EMAIL`, before `absoluteUrl`:

```ts
/**
 * GA4 measurement ID for the infinitelives.io web data stream.
 *
 * Public by construction — it ships in the page source of every analytics site,
 * so it belongs here beside `SITE_URL` rather than in a `.env` (which is
 * gitignored, and would break the Makefile's byte-identical dev/prod exports).
 *
 * The `G-` form of GA property 550710966 / data stream 15463222007, which
 * Firebase created alongside the web app in the `sil008` project. Recover it
 * with `firebase apps:sdkconfig WEB <appId>` if it is ever in doubt — but note
 * the site itself uses no Firebase SDK, only gtag.js.
 *
 * **EMPTY MEANS OFF**, and every entry point in `lib/analytics.ts` checks: with
 * no ID there is no gtag.js, no consent banner and no cookie of any kind. That
 * is the switch to flip to take analytics off the site entirely.
 *
 * Note that the review site sil008-dev.web.app reports into the same property:
 * dev and prod exports are byte-identical on purpose (see the Makefile).
 */
export const GA_MEASUREMENT_ID = "G-F1R5Z95KM1";
```

### 2. `src/lib/consent.ts` — decision + persistence (new, pure, tested)

Port of `sil_common/lib/utils/cookie_consent.dart` plus `cookie_cleanup_web.dart`. No React, no
gtag — this file is what `consent.test.ts` exercises.

```ts
export const COOKIE_CONSENT_VERSION = 1;

export interface ConsentChoice {
  analyticsGranted: boolean;
  version: number;
  /** Epoch milliseconds. */
  decidedAt: number;
}
```

- `parseConsentChoice(raw: unknown): ConsentChoice | null` — returns `null` for anything malformed
  or legacy, so a corrupt blob re-prompts instead of throwing. Field names match the Dart exactly
  (`analyticsGranted`, `version`, `decidedAt`).
- `needsConsent(stored: ConsentChoice | null, currentVersion = COOKIE_CONSENT_VERSION): boolean` —
  `true` when `stored` is null or `stored.version < currentVersion`. A _higher_ stored version is
  treated as up to date, same as the Dart.
- `readConsent(): ConsentChoice | null` / `writeConsent(choice: ConsentChoice): void` —
  `localStorage` under `CONSENT_STORAGE_KEY = "cookie_consent"`, JSON. **Every access wrapped in
  try/catch**: Safari private mode and cookie-blocking extensions throw on `localStorage` access
  itself, and an exception here would blank the whole site.
- `expireAnalyticsCookies(): void` — port of `cookie_cleanup_web.dart`. Walk `document.cookie`, and
  for each name that is `_ga` or starts with `_ga_`, write an expiry across every variant from
  `domainVariants(location.hostname)`.
- `export function domainVariants(host: string): string[]` — `["", host, "." + host]`, plus the
  registrable parent and its dot-prefixed form when the host has more than two labels. Exported
  because it is the fiddly bit worth testing directly.

Carry over the Dart's doc comments on _why_ the version field exists and why a corrupt blob returns
null rather than throwing.

### 3. `src/lib/analytics.ts` — the gtag seam (new)

```ts
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}
```

- `isAnalyticsConfigured(): boolean` → `GA_MEASUREMENT_ID !== ""`. Every entry point below returns
  early when this is false, and `SiteAnalytics` renders `null`.
- `loadGtag(): void` — idempotent (guard on a module-level `loaded` flag).
  1. `window.dataLayer ??= []`
  2. define `window.gtag` with the **canonical** Google form — a `function` declaration pushing
     `arguments`, not an arrow pushing a rest array:
     ```ts
     /* eslint-disable prefer-rest-params */
     window.gtag = function gtag() {
       window.dataLayer!.push(arguments);
     } as Window["gtag"];
     ```
  3. `gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" })`
     — the four keys from `sil006/web/index.html:58-63`, in that order.
  4. `gtag("js", new Date())`
  5. `gtag("config", GA_MEASUREMENT_ID, { send_page_view: false })` — **`send_page_view: false` is
     load-bearing.** `trackPageView` below sends the first one, so leaving it on double-counts every
     landing page.
  6. Inject `<script async src="https://www.googletagmanager.com/gtag/js?id=…">` into `document.head`
     via `document.createElement`. Do **not** use `next/script` here: the script must not exist in
     the markup at all before consent, and a conditionally-rendered `<Script>` still goes through
     Next's loader queue.
- `setAnalyticsConsent(granted: boolean): void`
  - granted: `window[\`ga-disable-${GA_MEASUREMENT_ID}\`] = false`, `loadGtag()`, then
`gtag("consent", "update", { analytics_storage: "granted" })`. Ad signals are **not** re-sent —
    they stay denied from the defaults.
  - denied: `window[\`ga-disable-${GA_MEASUREMENT_ID}\`] = true`, then, only if gtag was already
loaded, `gtag("consent", "update", { analytics_storage: "denied" })`, then
`expireAnalyticsCookies()`. The disable flag is the part that actually stops the cookieless
    pings — write the comment saying so, it is not obvious.
- `trackEvent(name: string, params: Record<string, string | number | boolean>): void` — no-ops
  unless configured and `window.gtag` exists.
- `trackPageView(): void` → `trackEvent`-style call of
  `gtag("event", "page_view", { page_location: window.location.href, page_path: location.pathname, page_title: document.title })`.

### 4. `src/lib/click-tracking.ts` — deriving an event from a click (new, pure, tested)

No DOM listeners and no gtag in here — it takes an `Element` and returns a description, which is
what makes it testable.

```ts
export interface ClickDescription {
  name: "link_click" | "button_click";
  params: {
    label: string;
    area: string;
    link_url?: string;
    outbound?: boolean;
  };
}

export function describeClickTarget(
  target: Element,
  currentHost: string,
): ClickDescription | null;
```

Behaviour:

- Walk up with `target.closest("a[href], button, [role='button']")`. No match → `null`.
- `closest("[data-analytics='off']")` anywhere up the tree → `null`. This is how the consent UI
  keeps itself out of the reports.
- **Label**, first non-empty of: `data-analytics-id` → `aria-label` → text content with whitespace
  collapsed (`replace(/\s+/g, " ").trim()`) → `title` → for a link, its `pathname`. Fall back to
  `"unlabelled"`. **Truncate to 100 characters** — GA4 drops the whole event if a parameter value
  is longer.
- **Area**, first of: nearest `[data-analytics-area]` ancestor's value → nearest ancestor whose
  tag is `header`, `footer`, `nav`, `main`, `article` or `section`, lowercased → `"page"`.
- Links only: `link_url` = the resolved `href`; `outbound` = `link.hostname !== currentHost`.
  `mailto:` counts as outbound.
- Event name is `link_click` for `<a href>`, `button_click` otherwise. Both are valid GA4 custom
  names (≤40 chars, snake_case, not reserved).

### 5. `src/components/analytics/SiteAnalytics.tsx` — the single client entry (new)

`"use client"`. Mounted once from the root layout. Owns all consent state so nothing else has to.

State: `mounted: boolean`, `choice: ConsentChoice | null`, `preferencesOpen: boolean`.

- **Render `null` when `!isAnalyticsConfigured()`.** With an empty ID the site behaves exactly as it
  does today.
- On mount: `setChoice(readConsent())`, `setMounted(true)`, and if a choice was stored, apply it
  with `setAnalyticsConsent(choice.analyticsGranted)` — **without** logging a consent event, since
  restoring a stored decision is not a fresh one (this is the Dart's `logConsentGranted: null`
  distinction, `cookie_consent_service.dart:20-22`).
- **Nothing renders until `mounted`.** `localStorage` does not exist during the export, so a banner
  rendered on the server would both mismatch on hydration and flash at a visitor who already
  decided. Mirror the reasoning in `cookie_consent_banner.dart`'s `build`.
- Banner shows when `mounted && needsConsent(choice)`.
- `decide(granted: boolean)`: write the choice first, then apply it — a crash mid-apply must still
  leave the decision remembered (`cookie_consent_service.dart:46-49` says exactly this). On a grant
  only, fire `trackEvent("cookie_consent_updated", { analytics_granted: 1 })` — the same name and
  parameter as `sil006/lib/services/analytics_events.dart:173-176`. Never report a refusal to the
  tool being refused.
- Page views: `const pathname = usePathname()`, and an effect on `[pathname, granted]` calling
  `trackPageView()`. Use `usePathname` **only** — `useSearchParams` forces a Suspense boundary and
  a static export has no server-side query string anyway.
- Click capture: an effect, active only while granted, that adds a `click` listener on `document`
  with `{ capture: true }`, calls `describeClickTarget(event.target as Element, location.hostname)`
  and forwards a non-null result to `trackEvent`. Capture phase so a handler calling
  `stopPropagation()` cannot swallow the event. Guard `event.target instanceof Element`. Remove the
  listener in the cleanup.
- Listens on `window` for `"sil:cookie-preferences"` and opens the dialog — that is how the footer
  button reaches this component without prop-drilling through two server components.

### 6. `CookieBanner.tsx` and `CookiePreferences.tsx` (new, in `src/components/analytics/`)

Both `"use client"`, both pure presentation taking callbacks. Both carry `data-analytics="off"` on
their root so §4 skips them.

**`CookieBanner`** — `props: { onCustomize, onEssentialOnly, onAcceptAll }`.

`fixed inset-x-0 bottom-0 z-50` wrapper, inner card `border-line bg-surface mx-auto m-3 max-w-3xl
rounded-2xl border p-4 shadow-xl`. Only semantic tokens — it renders over every section, so it must
re-colour per section like everything else. `role="region" aria-label="Cookie consent"`. Not a
focus trap: it is a banner, not a modal.

Copy, adapted from `cookie_consent_banner.dart` (site, not app):

> We use essential storage to run this site and, with your permission, optional analytics cookies to
> understand aggregate usage. **Learn more** _(a `<Link href="/privacy">`)_

Actions in a `flex flex-wrap justify-end gap-2`, in this order: `Customize` (`variant="outline"`),
`Essential only` (`variant="outline"`), `Accept all` (default). Equal weight is the point.

**`CookiePreferences`** — `props: { open, initialAnalyticsGranted, onCancel, onSave(granted) }`.

A native `<dialog>` driven by a ref: `showModal()` when `open` goes true, `close()` when false, and
an `onClose` handler wired to `onCancel` so Escape works. No shadcn dialog, no new dependency.
Style the backdrop with `[&::backdrop]:bg-black/50`; the dialog itself gets
`bg-surface text-ink border-line rounded-2xl border p-6`.

Title "Cookie Preferences". Two rows, transcribed from `showCookiePreferencesDialog`:

- **Essential** — "Required to serve this site and to remember your cookie choice. Always on." A
  checked, `disabled` checkbox.
- **Analytics** — "Google Analytics cookies that help us understand aggregate usage. Optional." The
  one real toggle, held in local state seeded from `initialAnalyticsGranted`.

Actions: `Cancel` (`variant="outline"`) and `Save`.

### 7. `src/lib/legal.ts` — load a document this repo owns

Add beside `loadLegalDocument`, **without** touching the mirrored path or `LEGAL_VERSION`:

```ts
/**
 * The studio's own privacy notice version. Unrelated to `LEGAL_VERSION`, which
 * tracks what habisloth.app is serving — this document has no upstream, so the
 * markdown and the constant live in the same commit and the assertion below
 * only exists to stop the constant rotting away from the file.
 */
export const SITE_LEGAL_VERSION = 1;

/** Loads a legal document committed to this repo, with no remote to mirror. */
export async function loadLocalLegalDocument(
  fileName: string,
  expectedVersion: number,
): Promise<LegalDocument>;
```

Reads `path.join(FALLBACK_DIR, fileName)`, runs it through the existing `parseLegalMarkdown`, and
returns `origin: "fallback"`. Do not widen `LEGAL_DOCUMENTS` or the `LegalDocumentId` union — that
type is about the two mirrored Habi Sloth documents and adding a third arm makes the
fetch-and-assert path lie.

### 8. `src/content/legal/site-privacy.md` (new)

Written to the parser's subset: `#` title, the effective-date line, `##` headings standing alone,
paragraphs, `-` bullets, `**strong**`, `` `code` ``. **No markdown links, no numbered lists, no
`###`.** Bare URLs and email addresses as plain text.

```markdown
# Privacy and Cookies

**Effective date: September 4, 2026 (version 1)**

This notice covers infinitelives.io, the website of Studio Infinite Lives, LLC. It does not cover
the Habi Sloth app, which has its own privacy policy at infinitelives.io/habisloth/privacy.

## What this site is

A set of static pages describing what the studio makes. There are no accounts, no sign-in, and no
forms. We never ask you for your name, your email address, or anything else about you.

## Analytics, only if you allow it

With your permission we use Google Analytics to count visits and see which pages people read and
which links they follow. It tells us that a page was read, not who read it.

Analytics is **off until you turn it on**. Nothing is loaded from Google and no cookie is written
until you choose "Accept all" in the cookie banner. If you choose "Essential only", the analytics
script is never fetched at all.

## Cookies

**Essential.** One entry in your browser's local storage, named `cookie_consent`, remembering the
choice you made so we do not ask again. It is not a tracking cookie and is never sent to us or to
anyone else.

**Analytics, optional.** When you allow analytics, Google Analytics sets cookies named `_ga` and
`_ga_` followed by an identifier, used to recognise a returning browser and to group page views
into a visit. They are set only after you say yes.

We use no advertising or marketing cookies, and we do not share anything with advertisers. Google's
advertising signals are switched off for this site at all times.

## Changing your mind

Choose **Cookie Preferences** at the bottom of any page. Turning analytics off stops collection
immediately and expires the `_ga` cookies that were already set. You can also clear cookies and
site data for this domain in your browser, which resets the choice and brings the banner back.

## What we collect without analytics

Nothing beyond the ordinary server logs kept by our hosting provider, Google Firebase Hosting, which
records requests in order to serve pages and protect against abuse. We do not use those logs to
build a profile of you.

## Your rights

**If you are in the EEA or the UK**, you have the right to access, correct, erase, and port your
data, to object to or restrict processing, and to complain to your data protection authority.
Analytics on this site is processed with your consent, which you can withdraw at any time.

**If you are in California**, you have the right to know what we collect, to delete it, to correct
it, and not to be discriminated against for exercising those rights. We do not sell or share
personal information.

## Changes to this notice

If the set of cookies materially changes we bump the version number above, and the banner asks you
again rather than assuming your old answer still applies.

## Contact

Questions about your privacy? Contact us at hello@infinitelives.io.

© 2026 Studio Infinite Lives, LLC. All rights reserved.
```

If the work lands on a different day, change the effective date to match — do not leave a date in
the future.

### 9. `src/app/privacy/page.tsx` (new)

Modelled on `app/habisloth/privacy/page.tsx`, but with `loadLocalLegalDocument` and **no**
`HabiSlothLinks` and no `data-section` layout — this is studio chrome, so it renders in the studio
palette.

```tsx
export const metadata: Metadata = {
  title: "Privacy and Cookies",
  description:
    "How infinitelives.io uses cookies and analytics, and how to change your choice.",
  alternates: { canonical: "/privacy" },
};
```

Body: `PageShell` with `eyebrow="Studio Infinite Lives"`, `title={document.title}`,
`lede={\`Effective ${document.effectiveDate} — version ${document.version}.\`}`, wrapping
`<LegalDocumentBody document={document} />`.

**Create this file before §10 and §11.** `typedRoutes` generates route types from the filesystem;
referencing `/privacy` first fails the build in a way that reads like a config problem.

### 10. `src/app/sitemap.ts`

Add after the `/habisloth/terms` entry:

```ts
{ path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
```

### 11. `src/components/SiteFooter.tsx`

The file's doc comment currently explains that no legal links live here because they are all
per-product. That is no longer true — `/privacy` is the studio's own. **Update the comment** to say
the studio notice belongs here precisely because it governs the whole site, while per-product
policies still do not.

Add, after the copyright `<p>`: a `<Link href="/privacy">Privacy</Link>` and a new
`<CookiePreferencesButton />`, both `text-subtle hover:text-ink`.

### 12. `src/components/CookiePreferencesButton.tsx` (new)

`"use client"`, seven lines: a `<button type="button">` reading "Cookie Preferences" that dispatches
`new CustomEvent("sil:cookie-preferences")` on `window`. Carries `data-analytics="off"`.

It returns `null` when `!isAnalyticsConfigured()` — with no measurement ID there are no preferences
to set, and a button opening a dialog about cookies that do not exist is worse than no button.

Keep `SiteFooter` a server component: only this button and `SiteAnalytics` are clients.

### 13. `src/app/layout.tsx`

Import `SiteAnalytics` and render it inside `ThemeProvider`, after `<SiteFooter />`. It must be
inside the provider so the banner picks up the theme, and last so the fixed banner sits above the
page without a `z-index` fight with the sticky header (`SiteHeader` is `z-50`; the banner is
`z-50` too and later in the DOM, which is enough).

### 14. Disambiguating labels — `data-analytics-id` / `data-analytics-area`

Three places render the _same_ button text twice on one page, so the derived label alone cannot
tell them apart. Add attributes only here; everywhere else the derived label is correct.

- `src/app/teamevl/page.tsx` — `CallToAction` renders "Buy Team EvL" and "Download Rules" in both
  the hero and the closing band. Give `CallToAction` an `area: string` prop and put
  `data-analytics-area={area}` on its wrapping `<div>`; pass `"hero"` at line ~155 and `"closing"`
  at line ~273.
- `src/app/habisloth/page.tsx` — the same "Get Habi Sloth" button appears at lines ~51-57 and
  ~184-190. Wrap each in nothing new; instead add `data-analytics-id="get-habisloth-hero"` and
  `data-analytics-id="get-habisloth-closing"` to the two `<a>` elements.
- `src/app/teamevl/rules/page.tsx` — every row's button reads "Download PDF"
  (`rules/page.tsx:85-93`). Add `data-analytics-id={\`download-rules-${book.version}\`}`to the`<a>`, so the edition is in the report the same way it is in the `sr-only` span beside it.

Do not sprinkle these anywhere else. The point of delegated capture is that the other twenty-odd
links need no change at all.

### 15. Tests

Two new lib test files, matching the existing lib-test style (`src/lib/legal.test.ts`).

**`src/lib/consent.test.ts`**

- `parseConsentChoice`: round-trips a valid object; returns `null` for a missing field, for a
  wrong-typed field (`analyticsGranted: "yes"`), and for a non-object.
- `needsConsent`: `null` → true; `version: 0` → true; `version: 1` → false; `version: 2` → false
  (a higher version is treated as current).
- `readConsent` / `writeConsent`: round-trip through jsdom's `localStorage`; a corrupt string under
  the key reads back as `null`, not a throw.
- `domainVariants`: `"infinitelives.io"` → `["", "infinitelives.io", ".infinitelives.io"]`;
  `"sil008-dev.web.app"` also yields `"web.app"` and `".web.app"`.
- `expireAnalyticsCookies`: seed `document.cookie` with `_ga`, `_ga_ABC123` and an unrelated
  `theme`, run it, and assert only the `_ga*` names were written with a past expiry — jsdom does
  not honour `domain=`, so assert on what was written rather than on what survives.

**`src/lib/click-tracking.test.ts`**

Build DOM with `document.body.innerHTML` and query the target; no React needed.

- A `<button>` with text → `button_click`, label from the text, no `link_url`.
- `data-analytics-id` beats `aria-label` beats text.
- Whitespace in text content is collapsed to single spaces.
- A label over 100 characters is truncated to exactly 100.
- An `<a href="/teamevl">` → `link_click`, `outbound: false`.
- An `<a href="https://thegamecrafter.com/…">` → `outbound: true`.
- A click on an `<svg>` inside a `<button>` resolves to the button (the `ThemeToggle` case).
- Anything under `[data-analytics="off"]` → `null`.
- A click on a bare `<p>` → `null`.
- `area` comes from the nearest `[data-analytics-area]`, else the enclosing landmark tag, else
  `"page"`.

`make check` is the gate. `typecheck` catches the `/privacy` route and the `Window` augmentation;
`legal.test.ts`'s last block runs the parser over every committed document, so a construct in
`site-privacy.md` that the renderer cannot handle fails there rather than on deploy — **confirm it
actually picks the new file up, and extend that block if it enumerates `LEGAL_DOCUMENTS` rather
than globbing the directory.**

### 16. Manual verification

`make serve`, then in a fresh browser profile:

- Banner appears on first load, does not reappear on the second page or after a reload.
- "Essential only" leaves no `_ga` cookie and no request to googletagmanager.com.
- "Accept all" loads gtag, fires one `page_view` (not two), and a client navigation to `/teamevl`
  fires a second.
- Clicking around produces `link_click` / `button_click` events with sane labels in GA's realtime
  DebugView.
- Footer "Cookie Preferences" opens the dialog, Escape closes it, toggling analytics off expires
  the `_ga*` cookies and stops further sends.
- Both themes, and both product sections — the banner must re-colour under `[data-section]`.

Then set `GA_MEASUREMENT_ID` to `""` for one run and confirm the site is byte-for-byte the site it
is today: no banner, no footer preferences button, no request to googletagmanager.com. That empty
path is the off switch for the whole feature, so it has to be exercised rather than assumed.
**Restore the real ID before finishing.**

Local dev reports into the live property like everything else. Prefer GA's DebugView over the
realtime report while clicking around, and keep the session short.

## Gotchas that bite here

- **Do not stage, commit or push.** Everything stays unstaged.
- **`AGENTS.md`: this is Next 16.3.1, not the Next in your training data.** Read
  `node_modules/next/dist/docs/01-app/02-guides/scripts.md` and the `usePathname` reference before
  writing the client components. That `AGENTS.md` block is regenerated by `next dev`; if it
  reappears as an uncommitted change, leave it.
- **Do not install `@next/third-parties`.** Its `GoogleAnalytics` component loads gtag on mount with
  no consent seam, which is the exact thing this issue exists to prevent.
- **Order matters:** `app/privacy/page.tsx` before `sitemap.ts` and `SiteFooter`. `typedRoutes`
  reads the filesystem.
- **`send_page_view: false` in the `config` call.** Forgetting it double-counts every landing page,
  and the duplicate is invisible in DebugView unless you are looking for it.
- **`ga-disable-<ID>` is what actually stops collection.** Consent Mode alone still sends cookieless
  pings after a refusal.
- **Wrap every `localStorage` access in try/catch.** Reading it throws outright in some privacy
  configurations, and an unhandled throw in a mount effect blanks the page.
- **The banner must not render server-side.** Gate on a `mounted` flag, not on
  `typeof window !== "undefined"` inside the render body — the latter still mismatches hydration.
- **GA4 caps parameter values at 100 characters** and drops the whole event when one is longer.
  The truncation in `describeClickTarget` is not cosmetic.
- **GA4 Enhanced Measurement already auto-collects an outbound `click` event and `file_download`.**
  The `link_click` events here will sit alongside those, and the rulebook PDFs will appear as both.
  That is a property setting in the GA console, not something to work around in code — mention it
  in the closing report rather than disabling anything.
- **The legal parser rejects `[text](url)`.** The privacy markdown in §8 already avoids it; if you
  reword anything, keep it link-free.
- **Do not touch `LEGAL_VERSION` or the `habisloth.app` fetch path.** The studio notice has its own
  version constant precisely so the two cannot interfere.
- The consent copy is transcribed from the shipped Habi Sloth banner so the two properties read
  alike. Do not "improve" the wording.
