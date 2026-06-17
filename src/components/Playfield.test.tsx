import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { sampleSession } from "../test/fixtures";
import { Playfield } from "./Playfield";

describe("Playfield", () => {
  it("shows the stage, hand cards, and a turn indicator for the human", () => {
    render(<Playfield state={sampleSession} loading={false} />);

    expect(screen.getByText("Your turn")).toBeInTheDocument();
    expect(screen.getByText("Front row Yotsuba")).toBeInTheDocument();
    expect(screen.getByText("Opponent public card")).toBeInTheDocument();
    expect(screen.getByText("Yotsuba Nakano")).toBeInTheDocument();
    expect(screen.getByText("Choice Climax")).toBeInTheDocument();
    expect(screen.getByText(/Opponent hidden zones remain redacted/i)).toBeInTheDocument();
  });

  it("shows a finished indicator for terminal states", () => {
    render(<Playfield state={{ ...sampleSession, human_turn: false, terminal: true }} loading={false} />);

    expect(screen.getByText("Match over")).toBeInTheDocument();
    expect(screen.queryByText("Your turn")).not.toBeInTheDocument();
  });

  it("marks accepted mulligan toggles in the hand", () => {
    const state = {
      ...sampleSession,
      view: {
        ...sampleSession.view,
        summary: { ...sampleSession.view.summary, phase: "mulligan" },
        legal_actions: [
          {
            action_id: 11,
            label: "Toggle Yotsuba Nakano",
            family: "mulligan_select",
            source_refs: [{ card: { name: "Yotsuba Nakano", card_no: "5HY/W90-001" }, ref_id: "self.hand.0" }],
            params: { hand_index: 0 },
          },
        ],
      },
    };

    render(<Playfield state={state} loading={false} markedActionIds={new Set([11])} />);

    expect(screen.getByTitle("Yotsuba Nakano — Toggle Yotsuba Nakano")).toHaveAttribute("aria-pressed", "true");
  });

  it("shows public waiting room cards and a longer opponent action feed", () => {
    const state = {
      ...sampleSession,
      human_turn: true,
      history: Array.from({ length: 7 }, (_, index) => ({
        decision_index: index,
        actor_seat: 1,
        actor_kind: "model" as const,
        label: `Opponent move ${index}`,
        phase: index < 3 ? "Main" : "Attack",
      })),
    };

    render(<Playfield state={state} loading={false} />);

    expect(screen.getByText("Used Event")).toBeInTheDocument();
    expect(screen.queryByText("Opponent move 0")).not.toBeInTheDocument();
    expect(screen.getByText("Opponent move 1")).toBeInTheDocument();
    expect(screen.getByText("Opponent move 6")).toBeInTheDocument();
    expect(screen.getAllByText("Attack").length).toBeGreaterThan(0);
  });

  it("opens pinned card details when a staged card has no legal action", async () => {
    const user = userEvent.setup();
    const onInspect = vi.fn();

    render(
      <Playfield
        state={{ ...sampleSession, view: { ...sampleSession.view, legal_actions: [{ action_id: 22, label: "Pass", family: "pass", is_pass: true }] } }}
        loading={false}
        onInspect={onInspect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Front row Yotsuba/ }));

    expect(onInspect).toHaveBeenCalledWith(
      expect.objectContaining({
        card: expect.objectContaining({ name: "Front row Yotsuba" }),
        actions: [],
        pinned: true,
      }),
    );
  });
});
