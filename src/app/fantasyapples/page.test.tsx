import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Page from "@/app/fantasyapples/page";
import { FA_APP_URL, FA_LEGAL_LINKS } from "@/lib/faLinks";

afterEach(cleanup);

describe("/fantasyapples", () => {
  it("has a headline and a section per feature", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Fantasy hockey, by the numbers.",
    );
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(7);
  });

  it("describes every screenshot", () => {
    render(<Page />);

    // The hero logo is decorative and `alt=""`, so it is not an `img`.
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(5);
    for (const image of images) {
      expect(image.getAttribute("alt")?.length).toBeGreaterThan(0);
    }
  });

  it("describes the demo video through its play/pause button", () => {
    render(<Page />);

    expect(
      screen.getByRole("button", { name: /filtering the Players grid/ }),
    ).toBeInTheDocument();
  });

  it("sends both calls to action to the app, told apart for analytics", () => {
    render(<Page />);

    const ctas = within(screen.getByRole("main")).getAllByRole("link", {
      name: "Open Fantasy Apples",
    });
    expect(ctas).toHaveLength(2);
    for (const link of ctas) expect(link).toHaveAttribute("href", FA_APP_URL);
    expect(
      new Set(ctas.map((link) => link.getAttribute("data-analytics-id"))).size,
    ).toBe(2);
  });

  it("links the app's own legal pages", () => {
    render(<Page />);

    const nav = within(
      screen.getByRole("navigation", { name: "Fantasy Apples legal" }),
    );
    for (const { href, label } of FA_LEGAL_LINKS) {
      expect(nav.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }
  });
});
