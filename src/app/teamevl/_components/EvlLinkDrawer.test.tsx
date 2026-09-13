import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { EvlLinkDrawer } from "@/app/teamevl/_components/EvlLinkDrawer";
import { evlLinks } from "@/lib/evlLinks";

/**
 * The drawer's contract: shut until asked for, carries the whole link list,
 * every way out works.
 *
 * The panel is never unmounted, only translated off-screen, so "closed" is
 * asserted through `inert` and `aria-expanded` rather than absence. `inert` is
 * the load-bearing one: it keeps a keyboard user out of an off-screen drawer.
 *
 * Transform classes are deliberately not asserted; pinning them would make
 * every restyle a test edit.
 */

const tab = () => screen.getByRole("button", { name: /looking for me/i });
const panel = () => screen.getByRole("navigation", { name: /drawer/i });

afterEach(cleanup);

describe("EvlLinkDrawer", () => {
  it("starts closed, with the links out of reach", () => {
    render(<EvlLinkDrawer />);

    expect(tab()).toHaveAttribute("aria-expanded", "false");
    expect(panel()).toHaveAttribute("inert");
  });

  it("names the panel it controls", () => {
    render(<EvlLinkDrawer />);

    expect(tab()).toHaveAttribute("aria-controls", panel().id);
    expect(panel().id).not.toBe("");
  });

  it("opens on the tab and closes on it again", async () => {
    const user = userEvent.setup();
    render(<EvlLinkDrawer />);

    await user.click(tab());
    expect(tab()).toHaveAttribute("aria-expanded", "true");
    expect(panel()).not.toHaveAttribute("inert");

    await user.click(tab());
    expect(tab()).toHaveAttribute("aria-expanded", "false");
    expect(panel()).toHaveAttribute("inert");
  });

  it("carries every Team EvL destination, in order", () => {
    render(<EvlLinkDrawer />);

    const hrefs = [...panel().querySelectorAll("a")].map((anchor) =>
      anchor.getAttribute("href"),
    );
    expect(hrefs).toEqual(evlLinks.map((item) => item.href));
  });

  it("sends off-site links to a new tab, safely", () => {
    render(<EvlLinkDrawer />);

    for (const item of evlLinks) {
      const anchor = panel().querySelector(`a[href="${item.href}"]`);
      if (item.kind === "external") {
        expect(anchor).toHaveAttribute("target", "_blank");
        expect(anchor).toHaveAttribute("rel", expect.stringContaining("no"));
      } else {
        expect(anchor).not.toHaveAttribute("target");
      }
    }
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<EvlLinkDrawer />);

    await user.click(tab());
    await user.keyboard("{Escape}");

    expect(tab()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on a click away from it", async () => {
    const user = userEvent.setup();
    render(<EvlLinkDrawer />);

    await user.click(tab());
    // The catcher is hidden from assistive technology, hence the attribute
    // query rather than a role query.
    const catcher = document.querySelector<HTMLElement>(
      'button[aria-hidden="true"]',
    );
    expect(catcher).not.toBeNull();
    await user.click(catcher!);

    expect(tab()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes behind a link that has been followed", async () => {
    const user = userEvent.setup();
    render(<EvlLinkDrawer />);

    // jsdom cannot navigate and logs to stderr on every real click, so the
    // default is swallowed after the component's handler has run.
    const swallow = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("click", swallow);
    try {
      await user.click(tab());
      await user.click(screen.getByRole("link", { name: "Rules Archive" }));
    } finally {
      document.removeEventListener("click", swallow);
    }

    expect(tab()).toHaveAttribute("aria-expanded", "false");
  });
});
