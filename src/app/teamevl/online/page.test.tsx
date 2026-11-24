import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Page from "@/app/teamevl/online/page";
import { EVL_PLAY_URL } from "@/lib/evlLinks";

afterEach(cleanup);

describe("/teamevl/online", () => {
  it("sends both play buttons to the game", () => {
    render(<Page />);

    const main = within(screen.getByRole("main"));
    const play = main.getAllByRole("link", { name: "Play Team EvL Online" });
    expect(play).toHaveLength(2);
    for (const link of play) {
      expect(link).toHaveAttribute("href", EVL_PLAY_URL);
    }
  });

  it("describes every screenshot", () => {
    render(<Page />);

    for (const image of screen.getAllByRole("img")) {
      expect(image.getAttribute("alt")?.length).toBeGreaterThan(0);
    }
  });
});
