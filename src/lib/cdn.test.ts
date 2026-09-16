import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evlPhotos } from "@/app/teamevl/_components/evlPhotos";
import {
  cardArt,
  cdnUrl,
  evlArt,
  evlBlooms,
  evlLogo,
  evlRules,
  habiArt,
  habiScreens,
  logoUrl,
} from "@/lib/cdn";

/**
 * Guards the published art in three parts:
 *
 * 1. Every declared URL resolves to a file in `cdn/`. A missing file renders a
 *    written stand-in rather than throwing, so a typo is otherwise invisible.
 * 2. Every declared size is the file's own, read back out of the headers.
 *    `next/image` is unoptimized, so nothing at runtime contradicts a wrong
 *    pair — the row just draws at the wrong shape.
 * 3. Copies of the app's art have not drifted from `sil006/cdn/`.
 *
 * Photographs come through `evlPhotos`, where their filenames are coined, and
 * get the same first two checks.
 *
 * `cdn/` is gitignored, so every check that reads it skips on a clone without it.
 * `make deploy-cdn` runs this file after confirming `cdn/` exists.
 *
 * The drift check compares files rather than published ETags, because the app's
 * REPO is the source of truth here: drift should fail when sil006 changes, not
 * when it deploys. The opposite of `legal.ts`, which must match what the app
 * SERVES. Skipped when `../sil006/cdn/` or this repo's `cdn/` is absent.
 */

const CDN_DIR = path.join(process.cwd(), "cdn");
const SIL006_CDN = path.join(process.cwd(), "..", "sil006", "cdn");

/** Copies of the app's art — the names must exist in both repos. */
const SHARED_WITH_APP = [
  "habi_beach.png",
  "habi_calendar.png",
  "habi_friends.png",
  "habi_idea_wide.png",
  "habi_weights.png",
];

const fileNameOf = (url: string) => new URL(url).pathname.slice(1);

/**
 * A file's pixel size, read out of its header.
 *
 * Hand-rolled rather than using `sharp`: sharp is in `node_modules` only as one
 * of Next's optional platform dependencies, so importing it would break on
 * whichever machine npm skipped the binary for.
 *
 * The JPEGs carry no EXIF (the downscale baked orientation into the pixels), so
 * a frame header is also the size a browser draws it at.
 */
function sizeOf(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);

  // PNG: an 8-byte signature, then IHDR, whose first two fields are the size.
  if (bytes.subarray(1, 4).toString() === "PNG") {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  // GIF: "GIF89a", then the logical screen descriptor — little-endian, unlike
  // PNG and JPEG.
  if (bytes.subarray(0, 3).toString() === "GIF") {
    return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  }

  // WebP: ONLY the extended (VP8X) header, which any WebP with alpha has. It
  // stores the canvas size minus one as two 24-bit little-endian fields.
  if (bytes.subarray(8, 12).toString() === "WEBP") {
    const chunk = bytes.subarray(12, 16).toString();
    if (chunk !== "VP8X") throw new Error(`${file}: WebP without VP8X`);
    return {
      width: bytes.readUIntLE(24, 3) + 1,
      height: bytes.readUIntLE(27, 3) + 1,
    };
  }

  // JPEG: walk the marker segments to the start-of-frame, which is the only one
  // that carries the size. Every SOFn in 0xC0–0xCF is one except 0xC4, 0xC8 and
  // 0xCC, which are Huffman and arithmetic tables that happen to sit in the
  // same range. Each segment declares its own length, so skipping is exact.
  let at = 2;
  while (at < bytes.length) {
    if (bytes[at] !== 0xff) throw new Error(`${file}: lost the marker chain`);
    const marker = bytes[at + 1] ?? 0;
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) {
      // Height first in a frame header, unlike either format above.
      return {
        width: bytes.readUInt16BE(at + 7),
        height: bytes.readUInt16BE(at + 5),
      };
    }
    at += 2 + bytes.readUInt16BE(at + 2);
  }
  throw new Error(`${file}: no start-of-frame`);
}

describe("cdnUrl", () => {
  it("builds a URL at the root of the studio art host", () => {
    expect(cdnUrl("site_card_pbnk.svg")).toBe(
      "https://cdn.infinitelives.io/site_card_pbnk.svg",
    );
  });

  it("names no app host and keeps no legacy path segment", () => {
    const url = cdnUrl("habi_week.png");
    expect(url).not.toContain("sil006");
    expect(url).not.toContain("/cdn/");
  });
});

const declared = [
  logoUrl,
  ...Object.values(cardArt),
  ...Object.values(habiArt),
  ...Object.values(habiScreens),
  evlLogo,
  ...Object.values(evlArt).map((art) => art.src),
  ...evlPhotos.map((photo) => photo.src),
  ...Object.values(evlBlooms),
  // Not art, but published from the same `cdn/` and subject to the same
  // orphan check — a rulebook nothing links to is still a live download.
  ...Object.values(evlRules),
];

describe("declared art", () => {
  it("every declared URL sits on the studio host", () => {
    for (const url of declared) {
      expect(url.startsWith("https://cdn.infinitelives.io/")).toBe(true);
      expect(new URL(url).pathname.split("/")).toHaveLength(2);
    }
  });
});

describe.skipIf(!existsSync(CDN_DIR))("published art", () => {
  it("every declared URL has a file in cdn/", () => {
    for (const url of declared) {
      const name = fileNameOf(url);
      expect(existsSync(path.join(CDN_DIR, name)), `cdn/${name} missing`).toBe(
        true,
      );
    }
  });

  it("ships no file that nothing references, except known spares", () => {
    // Deliberately held, referenced by nothing. Deleting published art is a
    // one-way door (immutable cache), which is why these stay:
    //   habi_wheel_shot.png      — for a page that does not exist yet.
    //   site_card_comingsoon.png — superseded by site_card_pbnk.svg.
    // Anything else unreferenced is a dead upload or a forgotten constant.
    const referenced = new Set(declared.map(fileNameOf));
    const spares = new Set(["habi_wheel_shot.png", "site_card_comingsoon.png"]);
    const orphans = readdirSync(CDN_DIR).filter(
      (name) => !referenced.has(name) && !spares.has(name),
    );
    expect(orphans).toEqual([]);
  });

  it("gives every Team EvL image the size it was actually uploaded at", () => {
    const sized = [...Object.values(evlArt), ...evlPhotos];
    for (const { src, width, height } of sized) {
      const file = path.join(CDN_DIR, fileNameOf(src));
      const { width: actual, height: actualHeight } = sizeOf(file);
      expect(
        [actual, actualHeight],
        `${fileNameOf(src)} is ${actual}×${actualHeight}`,
      ).toEqual([width, height]);
    }
  });
});

describe.skipIf(!existsSync(SIL006_CDN) || !existsSync(CDN_DIR))(
  "copies of the app's art",
  () => {
    it.each(SHARED_WITH_APP)("%s is byte-identical to sil006's", (name) => {
      const mine = path.join(CDN_DIR, name);
      const theirs = path.join(SIL006_CDN, name);

      expect(existsSync(mine), `cdn/${name} missing`).toBe(true);
      expect(existsSync(theirs), `sil006/cdn/${name} missing`).toBe(true);
      expect(
        readFileSync(mine).equals(readFileSync(theirs)),
        `${name} has drifted — copy sil006's version across and re-run \`make deploy-cdn\``,
      ).toBe(true);
    });

    it("is referenced by habiArt, so a stale name here fails loudly", () => {
      const referenced = new Set(Object.values(habiArt).map(fileNameOf));
      for (const name of SHARED_WITH_APP) {
        expect(referenced.has(name), `${name} is no longer used`).toBe(true);
      }
    });
  },
);
