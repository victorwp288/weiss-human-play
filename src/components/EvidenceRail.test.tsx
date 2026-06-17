import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { sampleSession } from "../test/fixtures";
import { EvidenceRail } from "./EvidenceRail";

describe("EvidenceRail", () => {
  it("summarizes terminal result evidence", () => {
    render(
      <EvidenceRail
        health={{ ok: true }}
        state={{
          ...sampleSession,
          human_turn: false,
          terminal: true,
          result: { decision_count: 122, status: "complete", winner_seat: 1 },
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("122")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText("Winner seat 1")).toBeInTheDocument();
  });

  it("renders public effect details for play-by-play entries", () => {
    render(
      <EvidenceRail
        health={{ ok: true }}
        state={{
          ...sampleSession,
          history: [
            {
              decision_index: 12,
              actor_kind: "model",
              actor_seat: 1,
              label: "Direct attack with center right",
              phase: "attack",
              details: ["Damage: seat 0 clock +1 -> 3", "Stock: seat 1 +1 -> 2"],
            },
          ],
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Damage: seat 0 clock +1 -> 3")).toBeInTheDocument();
    expect(screen.getByText("Stock: seat 1 +1 -> 2")).toBeInTheDocument();
  });
});
