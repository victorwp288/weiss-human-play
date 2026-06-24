import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { sampleSession } from "../test/fixtures";
import { PostgameBanner } from "./PostgameBanner";

describe("PostgameBanner", () => {
  it("shows a clear You win result and expandable match stats", async () => {
    const user = userEvent.setup();
    render(
      <PostgameBanner
        state={{
          ...sampleSession,
          terminal: true,
          result: {
            terminal: true,
            winner_seat: 0,
            decision_count: 42,
            termination_reason: "terminal",
            action_summary: { play: 12, attack: 8 },
          },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "You win" })).toBeInTheDocument();
    await user.click(screen.getByText("Match stats"));
    expect(screen.getByText("Winner seat")).toBeInTheDocument();
    expect(screen.getByText("Seat 0")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("play")).toBeInTheDocument();
  });

  it("uses bot labels in spectate mode", () => {
    render(
      <PostgameBanner
        state={{
          ...sampleSession,
          spectate: true,
          terminal: true,
          human_seat: 0,
          model_seat: 1,
          seat0_policy_id: "B3 HeuristicPublicAggro",
          seat1_policy_id: "main_league_selected",
          result: {
            terminal: true,
            winner_seat: 1,
            decision_count: 31,
            termination_reason: "terminal",
          },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Primary bot wins" })).toBeInTheDocument();
    expect(screen.getAllByText(/main_league_selected/).length).toBeGreaterThan(0);
  });
});
