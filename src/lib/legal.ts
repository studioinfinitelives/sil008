import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Habi Sloth's legal documents — fetched from the app at build time, not copied.
 *
 * The published policies live in `sil006/assets/legal/`. Flutter bundles
 * `assets/` into its web build, so the app itself serves them as plain markdown
 * at `habisloth.app/assets/assets/legal/{privacy,terms}.md`. That URL is the
 * source of truth: this site renders whatever the app is currently showing its
 * users, which is the only way two decoupled repos can be guaranteed to agree
 * on what the terms actually say.
 *
 * Two guards make that safe (plan §5):
 *
 * 1. **The version is asserted.** Every document carries an
 *    `**Effective date: … (version N)**` line. If `N` stops matching
 *    {@link LEGAL_VERSION}, the build throws. A bump in
 *    `sil006/lib/utils/legal.dart` therefore breaks this build loudly rather
 *    than silently serving terms that no longer match the app's.
 * 2. **A fallback copy is committed**, under `src/content/legal/`. If
 *    habisloth.app is unreachable the build uses the local copy instead of
 *    failing, so a static-site deploy never hard-depends on the app's uptime.
 *
 * Server-only: this module reads the filesystem and runs exclusively at build
 * time, since `output: "export"` renders every Server Component during
 * `next build`.
 */

/**
 * The document version this site is written against.
 *
 * Bumping this is a deliberate act: check what actually changed upstream, then
 * refresh the fallback copies in `src/content/legal/` in the same commit.
 */
export const LEGAL_VERSION = 3;

const REMOTE_BASE = "https://habisloth.app/assets/assets/legal";

/** The documents this module knows how to load. */
export const LEGAL_DOCUMENTS = {
  privacy: { remote: "privacy.md", fallback: "habisloth-privacy.md" },
  terms: { remote: "terms.md", fallback: "habisloth-terms.md" },
} as const;

export type LegalDocumentId = keyof typeof LEGAL_DOCUMENTS;

/* ────────────────────────────── document model ───────────────────────────── */

/** A run of text within a block. The documents use no other inline syntax. */
export type Inline =
  | { kind: "text"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "code"; value: string };

export type Block =
  | { kind: "heading"; text: Inline[] }
  | { kind: "paragraph"; text: Inline[] }
  | { kind: "list"; items: Inline[][] };

export interface LegalDocument {
  /** The `# …` title, e.g. "Privacy Policy". */
  title: string;
  /** The human-readable date from the effective-date line, e.g. "July 28, 2026". */
  effectiveDate: string;
  version: number;
  /** Everything after the effective-date line. */
  blocks: Block[];
  /** Where the markdown came from — `"fallback"` means habisloth.app was unreachable. */
  origin: "habisloth.app" | "fallback";
}

/* ─────────────────────────────────── parse ───────────────────────────────── */

/**
 * The markdown subset the published documents actually use: `#`/`##` headings,
 * `-` bullets, blank-line-separated paragraphs, `**strong**` and `` `code` ``.
 *
 * Anything outside that subset throws rather than rendering wrong. These are
 * legal documents — a link or table added upstream that this parser quietly
 * dropped would mean serving an incomplete policy, so the failure is loud and
 * the fix is to teach the parser the new construct.
 */
const UNSUPPORTED_BLOCKS: ReadonlyArray<{ test: RegExp; what: string }> = [
  { test: /^\s*>/, what: "block quotes" },
  { test: /^\s*\|/, what: "tables" },
  { test: /^\s*```/, what: "code fences" },
  { test: /^\s*\d+\.\s/, what: "numbered lists" },
  { test: /^#{3,}\s/, what: "h3 and deeper headings" },
];

const EFFECTIVE_DATE =
  /^\*\*Effective date:\s*(?<date>.+?)\s*\(version\s*(?<version>\d+)\)\*\*$/;

/** Splits inline text into runs of plain, `**strong**` and `` `code` ``. */
export function parseInline(source: string): Inline[] {
  if (/\[[^\]]*\]\([^)]*\)/.test(source)) {
    throw new Error(
      `Legal markdown uses links, which this renderer does not support yet: ${source}`,
    );
  }

  const runs: Inline[] = [];
  // One alternation so the two syntaxes cannot interleave incorrectly; the
  // capture groups tell us which one matched.
  const pattern = /\*\*(?<strong>[^*]+)\*\*|`(?<code>[^`]+)`/g;
  let cursor = 0;

  for (const match of source.matchAll(pattern)) {
    if (match.index > cursor) {
      runs.push({ kind: "text", value: source.slice(cursor, match.index) });
    }
    const { strong, code } = match.groups ?? {};
    if (strong !== undefined) {
      runs.push({ kind: "strong", value: strong });
    } else if (code !== undefined) {
      runs.push({ kind: "code", value: code });
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < source.length) {
    runs.push({ kind: "text", value: source.slice(cursor) });
  }
  return runs;
}

/**
 * Parses one published legal document.
 *
 * @param expectedVersion the version the site is written against; a mismatch
 *   throws, which is the whole point of the check.
 */
export function parseLegalMarkdown(
  markdown: string,
  { expectedVersion }: { expectedVersion: number },
): Omit<LegalDocument, "origin"> {
  // Paragraphs are soft-wrapped in the source, so blank lines are the only
  // block separator. \r\n guards against the file being edited on Windows.
  const paragraphs = markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

  const [titleChunk, dateChunk, ...rest] = paragraphs;

  const title = titleChunk?.match(/^#\s+(.+)$/)?.[1];
  if (title === undefined) {
    throw new Error(
      "Legal markdown does not start with an `# Title` heading — refusing to render it.",
    );
  }

  const dateMatch = dateChunk?.match(EFFECTIVE_DATE);
  if (!dateMatch?.groups) {
    throw new Error(
      `Legal markdown "${title}" has no \`**Effective date: … (version N)**\` line — refusing to render it.`,
    );
  }
  const { date, version: rawVersion } = dateMatch.groups as {
    date: string;
    version: string;
  };

  const version = Number(rawVersion);
  if (version !== expectedVersion) {
    throw new Error(
      `Legal version mismatch in "${title}": habisloth.app is serving version ${version}, ` +
        `but this site is written against ${expectedVersion}. Review the upstream change in ` +
        `sil006/assets/legal/, refresh the fallback copy in src/content/legal/, then bump ` +
        `LEGAL_VERSION in src/lib/legal.ts.`,
    );
  }

  return { title, effectiveDate: date, version, blocks: rest.map(toBlock) };
}

function toBlock(chunk: string): Block {
  const lines = chunk.split("\n");

  for (const line of lines) {
    const unsupported = UNSUPPORTED_BLOCKS.find(({ test }) => test.test(line));
    if (unsupported) {
      throw new Error(
        `Legal markdown uses ${unsupported.what}, which this renderer does not support yet: ${line}`,
      );
    }
  }

  const heading = lines[0]?.match(/^##\s+(.+)$/);
  if (heading?.[1] !== undefined) {
    if (lines.length > 1) {
      throw new Error(`Expected a heading to stand alone, got: ${chunk}`);
    }
    return { kind: "heading", text: parseInline(heading[1]) };
  }

  if (lines[0]?.startsWith("- ")) {
    // Bullets are soft-wrapped like paragraphs: `- ` opens an item and any
    // indented line that follows continues it.
    const items: string[] = [];
    for (const line of lines) {
      const bullet = line.match(/^-\s+(.+)$/)?.[1];
      if (bullet !== undefined) {
        items.push(bullet);
        continue;
      }

      const continuation = line.match(/^\s+(\S.*)$/)?.[1];
      const open = items.at(-1);
      if (continuation === undefined || open === undefined) {
        throw new Error(
          `Expected every line of a list to be a bullet or an indented continuation: ${chunk}`,
        );
      }
      items[items.length - 1] = `${open} ${continuation}`;
    }
    return { kind: "list", items: items.map(parseInline) };
  }

  // A soft-wrapped paragraph: rejoin so the browser can wrap it itself.
  return {
    kind: "paragraph",
    text: parseInline(lines.map((line) => line.trim()).join(" ")),
  };
}

/* ─────────────────────────────────── load ────────────────────────────────── */

const FALLBACK_DIR = path.join(process.cwd(), "src", "content", "legal");

/**
 * Loads a legal document, preferring the copy habisloth.app is serving right
 * now and falling back to the committed one if that fetch fails.
 *
 * A version mismatch is **not** a fetch failure and is never swallowed — it
 * propagates and fails the build.
 */
export async function loadLegalDocument(
  id: LegalDocumentId,
): Promise<LegalDocument> {
  const { remote, fallback } = LEGAL_DOCUMENTS[id];

  let markdown: string | undefined;
  try {
    const response = await fetch(`${REMOTE_BASE}/${remote}`, {
      cache: "force-cache",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    markdown = await response.text();
  } catch (cause) {
    console.warn(
      `[legal] Could not fetch ${remote} from habisloth.app (${String(cause)}); ` +
        `falling back to the committed copy. Note this build did not verify the ` +
        `live document's version.`,
    );
  }

  const origin = markdown === undefined ? "fallback" : "habisloth.app";
  markdown ??= await readFile(path.join(FALLBACK_DIR, fallback), "utf8");

  return {
    ...parseLegalMarkdown(markdown, { expectedVersion: LEGAL_VERSION }),
    origin,
  };
}

/**
 * The studio's own privacy notice version.
 *
 * Unrelated to {@link LEGAL_VERSION}, which tracks what habisloth.app is
 * serving. This document has no upstream — the markdown and the constant land
 * in the same commit — so the assertion below exists only to stop the constant
 * rotting away from the file it describes.
 */
export const SITE_LEGAL_VERSION = 1;

/**
 * Loads a legal document this repo owns, with no remote to mirror.
 *
 * Deliberately separate from {@link loadLegalDocument} rather than a third arm
 * of {@link LEGAL_DOCUMENTS}: that map is about the two Habi Sloth documents
 * fetched from the app, and a `remote` entry for a document that has no remote
 * would make the fetch-and-assert path lie about what it is checking.
 */
export async function loadLocalLegalDocument(
  fileName: string,
  expectedVersion: number,
): Promise<LegalDocument> {
  const markdown = await readFile(path.join(FALLBACK_DIR, fileName), "utf8");
  return {
    ...parseLegalMarkdown(markdown, { expectedVersion }),
    origin: "fallback",
  };
}
