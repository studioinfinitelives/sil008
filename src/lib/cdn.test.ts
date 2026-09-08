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
 * Guards the art this site publishes, in three parts.
 *
 * **Every URL resolves to a committed file.** A constant naming a file that is
 * not in `cdn/` renders a written stand-in rather than throwing, so a typo is
 * invisible until someone looks at the page.
 *
 * **Every declared size is the file's own.** `next/image` is unoptimized here,
 * so a width and height are pure layout reservation and nothing at runtime ever
 * contradicts them — a transposed pair just quietly draws the row at the wrong
 * shape. `sizeOf` reads the real numbers back out of the headers.
 *
 * The carousel's photographs are reached through `evlPhotos` rather than
 * `lib/cdn.ts`, because that is where their filenames are coined — see the note
 * there. They are published from the same `cdn/` and get the same two checks.
 *
 * **The app's art has not drifted.** Five Habi Sloth images are byte-identical
 * copies of `sil006/cdn/`, not hotlinks (see `habiArt`), so a recrop upstream
 * has to be carried across by hand. This compares the files rather than the
 * published `ETag`s: the app's *repo* is the source of truth here, so drift
 * should fail as soon as sil006 changes, not only once it deploys. That is the
 * opposite of `legal.ts`, where what the app *serves* is what must be matched.
 *
 * Skips when `../sil006` is absent, mirroring sil006's own `make test-common`.
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
 * A file's pixel size, read straight out of its header.
 *
 * Hand-rolled rather than taken from `sharp`: sharp is in `node_modules` as one
 * of Next's optional platform dependencies, not as anything this project
 * declares, so a test that imported it would break on whichever machine npm
 * decided not to install the binary for. The three formats `cdn/` holds each
 * put their dimensions within the first few bytes, and that is all this needs.
 *
 * The JPEGs carry no EXIF — the downscale baked any orientation into the pixels
 * — so a JPEG's frame header is also the size a browser draws it at.
 */
function sizeOf(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);

  // PNG: an 8-byte signature, then IHDR, whose first two fields are the size.
  if (bytes.subarray(1, 4).toString() === "PNG") {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  // GIF: "GIF89a", then the logical screen descriptor — little-endian, alone
  // among the three.
  if (bytes.subarray(0, 3).toString() === "GIF") {
    return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
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

describe("published art", () => {
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

  it("every declared URL has a committed file in cdn/", () => {
    for (const url of declared) {
      const name = fileNameOf(url);
      expect(existsSync(path.join(CDN_DIR, name)), `cdn/${name} missing`).toBe(
        true,
      );
    }
  });

  it("every declared URL sits on the studio host", () => {
    for (const url of declared) {
      expect(url.startsWith("https://cdn.infinitelives.io/")).toBe(true);
      expect(new URL(url).pathname.split("/")).toHaveLength(2);
    }
  });

  it("ships no file that nothing references, except known spares", () => {
    // Held deliberately, referenced by nothing:
    //   habi_wheel_shot.png      — for a page that does not exist yet.
    //   site_card_comingsoon.png — superseded by site_card_pbnk.svg, which is
    //     what `cardArt.comingSoon` actually points at. Kept because deleting
    //     published art is a one-way door (immutable cache), not because it is
    //     used. Drop it from cdn/ and from here together when you are sure.
    // Anything else unreferenced is a dead upload or a forgotten constant.
    const referenced = new Set(declared.map(fileNameOf));
    const spares = new Set(["habi_wheel_shot.png", "site_card_comingsoon.png"]);
    const orphans = readdirSync(CDN_DIR).filter(
      (name) => !referenced.has(name) && !spares.has(name),
    );
    expect(orphans).toEqual([]);
  });

  it("gives every Team EvL image the size it was actually uploaded at", () => {
    // These numbers do nothing but reserve the box: `next/image` is unoptimized
    // site-wide, so a wrong pair is invisible until the file lands and the row
    // resizes underneath the reader. Read from the file rather than trusted.
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

describe.skipIf(!existsSync(SIL006_CDN))("copies of the app's art", () => {
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
});
