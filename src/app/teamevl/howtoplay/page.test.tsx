import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Page from "@/app/teamevl/howtoplay/page";
import { EVL_BUY_URL, EVL_VIDEO_URL } from "@/lib/evlLinks";
import { currentRulebook } from "@/lib/rulebooks";

afterEach(cleanup);

describe("/teamevl/howtoplay", () => {
  it("covers winning, the turn, and every action the store page animates", () => {
    render(<Page />);

    expect(
      screen.getByRole("heading", { level: 1, name: "How to Play" }),
    ).toBeInTheDocument();
    for (const name of [
      "How To Win",
      "Your Turn",
      "Play",
      "Peek",
      "Draw",
      "Heal",
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
    }
  });

  it("describes every picture", () => {
    render(<Page />);

    // The blooms are decorative and deliberately `alt=""`, so they are
    // `presentation`, not `img`.
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(7);
    for (const image of images) {
      expect(image.getAttribute("alt")?.length).toBeGreaterThan(0);
    }
  });

  it("links the video, the current rules and the store", () => {
    render(<Page />);

    const main = within(screen.getByRole("main"));
    expect(main.getByRole("link", { name: "Watch the Video" })).toHaveAttribute(
      "href",
      EVL_VIDEO_URL,
    );
    for (const link of main.getAllByRole("link", { name: "Download Rules" })) {
      expect(link).toHaveAttribute("href", currentRulebook.url);
    }
    expect(main.getByRole("link", { name: "Buy Team EvL" })).toHaveAttribute(
      "href",
      EVL_BUY_URL,
    );
  });
});
