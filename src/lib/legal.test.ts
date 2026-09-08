import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  LEGAL_DOCUMENTS,
  LEGAL_VERSION,
  SITE_LEGAL_VERSION,
  parseInline,
  parseLegalMarkdown,
} from "@/lib/legal";

/**
 * The parser is the load-bearing part: it decides both what these pages say and
 * whether the build is allowed to succeed. The last block runs it over the real
 * committed documents, so an upstream refresh that introduces a construct the
 * renderer cannot handle fails here rather than on a deploy.
 */

const parse = (markdown: string, expectedVersion = LEGAL_VERSION) =>
  parseLegalMarkdown(markdown, { expectedVersion });

const doc = (body: string, version = LEGAL_VERSION) =>
  `# Privacy Policy\n\n**Effective date: July 28, 2026 (version ${version})**\n\n${body}\n`;

describe("parseInline", () => {
  it("returns a single run for plain text", () => {
    expect(parseInline("just words")).toEqual([
      { kind: "text", value: "just words" },
    ]);
  });

  it("splits strong and code out of the surrounding text", () => {
    expect(parseInline("sets `_ga` and is **not** used")).toEqual([
      { kind: "text", value: "sets " },
      { kind: "code", value: "_ga" },
      { kind: "text", value: " and is " },
      { kind: "strong", value: "not" },
      { kind: "text", value: " used" },
    ]);
  });

  it("throws on links, rather than dropping them from a legal document", () => {
    expect(() => parseInline("see [our policy](https://example.com)")).toThrow(
      /links/,
    );
  });
});

describe("parseLegalMarkdown", () => {
  it("reads the title and effective date off the header", () => {
    const result = parse(doc("## 1. Who we are\n\nWe are us."));
    expect(result.title).toBe("Privacy Policy");
    expect(result.effectiveDate).toBe("July 28, 2026");
    expect(result.version).toBe(LEGAL_VERSION);
  });

  it("rejoins a soft-wrapped paragraph into one block", () => {
    const result = parse(doc("This sentence is\nwrapped across lines."));
    expect(result.blocks).toEqual([
      {
        kind: "paragraph",
        text: [
          { kind: "text", value: "This sentence is wrapped across lines." },
        ],
      },
    ]);
  });

  it("groups consecutive bullets into one list", () => {
    const result = parse(doc("- first\n- second"));
    expect(result.blocks).toEqual([
      {
        kind: "list",
        items: [
          [{ kind: "text", value: "first" }],
          [{ kind: "text", value: "second" }],
        ],
      },
    ]);
  });

  it("folds an indented continuation back into its bullet", () => {
    const result = parse(doc("- first bullet that\n  wraps\n- second"));
    expect(result.blocks).toEqual([
      {
        kind: "list",
        items: [
          [{ kind: "text", value: "first bullet that wraps" }],
          [{ kind: "text", value: "second" }],
        ],
      },
    ]);
  });

  // The guard the whole build-time fetch exists for.
  it("throws when the upstream version has moved on", () => {
    expect(() => parse(doc("Body.", 4))).toThrow(
      /habisloth\.app is serving version 4.*written against 3/s,
    );
  });

  it("throws when the effective-date line is missing", () => {
    expect(() => parse("# Privacy Policy\n\nStraight into the body.")).toThrow(
      /Effective date/,
    );
  });

  it("throws when there is no title", () => {
    expect(() => parse("Straight into the body.")).toThrow(/# Title/);
  });

  it.each([
    ["block quotes", "> quoted"],
    ["tables", "| a | b |"],
    ["code fences", "```\ncode\n```"],
    ["numbered lists", "1. first"],
    ["h3 and deeper headings", "### Too deep"],
  ])("throws on %s", (what, body) => {
    expect(() => parse(doc(body))).toThrow(new RegExp(what));
  });
});

describe("the committed documents", () => {
  it.each(Object.entries(LEGAL_DOCUMENTS))(
    "parses %s at the expected version",
    async (_id, { fallback }) => {
      const markdown = await readFile(
        path.join(process.cwd(), "src", "content", "legal", fallback),
        "utf8",
      );
      const result = parse(markdown);

      expect(result.version).toBe(LEGAL_VERSION);

      // Both documents open with an unheaded intro, then numbered sections.
      expect(result.blocks[0]?.kind).toBe("paragraph");

      const headings = result.blocks
        .filter((block) => block.kind === "heading")
        .map((block) => block.text.map((run) => run.value).join(""));

      expect(headings.length).toBeGreaterThan(5);
      expect(headings[0]).toMatch(/^1\. /);
      // Both policies close by telling the reader how to reach us; if that
      // section ever disappears, the studio has a bigger problem than a parser.
      expect(headings.at(-1)).toMatch(/Contact$/);
    },
  );

  /**
   * The studio's own notice is not in `LEGAL_DOCUMENTS` — it has no upstream to
   * mirror — so it needs its own case, or a construct the renderer cannot handle
   * would sail past this file and fail on a deploy instead.
   */
  it("parses the studio privacy notice at its own version", async () => {
    const markdown = await readFile(
      path.join(process.cwd(), "src", "content", "legal", "site-privacy.md"),
      "utf8",
    );
    const result = parse(markdown, SITE_LEGAL_VERSION);

    expect(result.title).toBe("Privacy and Cookies");
    expect(result.version).toBe(SITE_LEGAL_VERSION);

    const headings = result.blocks
      .filter((block) => block.kind === "heading")
      .map((block) => block.text.map((run) => run.value).join(""));

    // The banner's "Learn more" is only honest if these two sections exist.
    expect(headings).toContain("Cookies");
    expect(headings).toContain("Changing your mind");
  });
});
