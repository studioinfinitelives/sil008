import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  type ConsentChoice,
  domainVariants,
  expireAnalyticsCookies,
  needsConsent,
  parseConsentChoice,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * The consent module is where "opt-in" is actually decided, so its failure modes
 * matter more than its happy path: a malformed blob must re-prompt rather than
 * throw, and a withdrawal must reach every domain scope GA might have used.
 */

const choice: ConsentChoice = {
  analyticsGranted: true,
  version: COOKIE_CONSENT_VERSION,
  decidedAt: 1_756_944_000_000,
};

describe("parseConsentChoice", () => {
  it("round-trips a well-formed choice", () => {
    expect(parseConsentChoice({ ...choice })).toEqual(choice);
  });

  it.each([
    ["a missing field", { analyticsGranted: true, version: 1 }],
    [
      "a wrong-typed flag",
      { analyticsGranted: "yes", version: 1, decidedAt: 1 },
    ],
    [
      "a non-integer version",
      { analyticsGranted: true, version: 1.5, decidedAt: 1 },
    ],
    ["a non-object", "granted"],
    ["null", null],
  ])("returns null for %s, so the banner asks again", (_what, raw) => {
    expect(parseConsentChoice(raw)).toBeNull();
  });
});

describe("needsConsent", () => {
  it("asks when nothing is stored", () => {
    expect(needsConsent(null)).toBe(true);
  });

  it("asks again when the stored choice predates the current version", () => {
    expect(needsConsent({ ...choice, version: 0 })).toBe(true);
  });

  it("does not ask when the stored choice is current", () => {
    expect(needsConsent(choice)).toBe(false);
  });

  // Shouldn't happen, but a downgrade must not re-prompt forever.
  it("treats a higher stored version as up to date", () => {
    expect(
      needsConsent({ ...choice, version: COOKIE_CONSENT_VERSION + 1 }),
    ).toBe(false);
  });
});

describe("readConsent / writeConsent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips through localStorage", () => {
    writeConsent(choice);
    expect(readConsent()).toEqual(choice);
  });

  it("reads back null when nothing was written", () => {
    expect(readConsent()).toBeNull();
  });

  // An unhandled throw here would run inside a mount effect and blank the page.
  it("reads back null rather than throwing on a corrupt entry", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "{not json");
    expect(readConsent()).toBeNull();
  });
});

describe("domainVariants", () => {
  it("covers the host and its dot-prefixed form for a bare domain", () => {
    expect(domainVariants("infinitelives.io")).toEqual([
      "",
      "infinitelives.io",
      ".infinitelives.io",
    ]);
  });

  it("adds the registrable parent for a subdomain", () => {
    expect(domainVariants("sil008-dev.web.app")).toEqual([
      "",
      "sil008-dev.web.app",
      ".sil008-dev.web.app",
      "web.app",
      ".web.app",
    ]);
  });
});

describe("expireAnalyticsCookies", () => {
  // jsdom does not honour `domain=`, so this asserts on what was *written*
  // rather than on what survives — the write is the whole behaviour anyway.
  it("expires every _ga cookie and leaves the others alone", () => {
    const written: string[] = [];
    const original = Object.getOwnPropertyDescriptor(
      Document.prototype,
      "cookie",
    );

    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => "_ga=GA1.1.x; _ga_ABC123=GS1.1.y; theme=dark",
      set: (value: string) => written.push(value),
    });

    try {
      expireAnalyticsCookies();
    } finally {
      Object.defineProperty(document, "cookie", {
        configurable: true,
        ...original,
      });
    }

    const names = written.map((entry) => entry.split("=")[0]);
    expect(new Set(names)).toEqual(new Set(["_ga", "_ga_ABC123"]));
    expect(written.every((entry) => entry.includes("01 Jan 1970"))).toBe(true);
    // Two cookies against the three variants of jsdom's `localhost`, and
    // nothing at all for `theme` — the unrelated cookie is never touched.
    expect(written).toHaveLength(
      2 * domainVariants(window.location.hostname).length,
    );
  });
});
