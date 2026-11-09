import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  SITE_LEGAL_VERSION,
  parseInline,
  parseLegalMarkdown,
} from "@/lib/legal";

/**
 * The parser decides both what these pages say and whether the build succeeds.
 * The last block runs it over the real committed document, so an unsupported
 * construct fails here, not on a deploy.
 */

const parse = (markdown: string, expectedVersion = SITE_LEGAL_VERSION) =>
  parseLegalMarkdown(markdown, { expectedVersion });

const doc = (body: string, version = SITE_LEGAL_VERSION) =>
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
    expect(result.version).toBe(SITE_LEGAL_VERSION);
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

  it("throws when the file's version doesn't match the site", () => {
    expect(() => parse(doc("Body.", 4))).toThrow(
      /the file is version 4.*written against 1/s,
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

    // The cookie banner's "Learn more" points here; these sections must exist.
    expect(headings).toContain("Cookies");
    expect(headings).toContain("Changing your mind");
  });
});
