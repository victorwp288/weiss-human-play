import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { sampleDecks } from "../test/fixtures";
import { SetupRail } from "./SetupRail";

describe("SetupRail", () => {
  it("shows the auto policy option only once when the API catalog also includes it", () => {
    render(
      <SetupRail
        health={{ ok: true }}
        decks={sampleDecks}
        runs={[]}
        policies={[
          {
            policy_id: "main_league_selected",
            label: "Auto-select strongest main model",
            kind: "alias",
            selected_by_default: true,
          },
          {
            policy_id: "policy_000001",
            label: "Policy 1",
            kind: "snapshot",
            selected_by_default: false,
          },
        ]}
        runDir="runs/example"
        policyId="main_league_selected"
        spectateOpponentPolicyId="B3 HeuristicPublicAggro"
        modelSamplingAlgorithm="pinned_cdf_pcg_v1"
        humanDeck={sampleDecks[0].deck_id}
        modelDeck={sampleDecks[0].deck_id}
        humanSeat={0}
        seed={20260521}
        mode="study"
        searchEnabled={false}
        busy={false}
        error={null}
        onRunDirChange={vi.fn()}
        onPolicyIdChange={vi.fn()}
        onSpectateOpponentPolicyIdChange={vi.fn()}
        onModelSamplingAlgorithmChange={vi.fn()}
        onHumanDeckChange={vi.fn()}
        onModelDeckChange={vi.fn()}
        onHumanSeatChange={vi.fn()}
        onSeedChange={vi.fn()}
        onModeChange={vi.fn()}
        onSearchEnabledChange={vi.fn()}
        onCreate={vi.fn()}
        onRefreshCatalog={vi.fn()}
      />,
    );

    const policySelect = screen.getByRole("combobox", { name: "Policy" });
    expect(within(policySelect).getAllByRole("option", { name: "Auto-select strongest main model" })).toHaveLength(1);
    expect(within(policySelect).getByRole("option", { name: "Policy 1" })).toBeInTheDocument();
  });

  it("shows spectate baseline and sampler controls", () => {
    render(
      <SetupRail
        health={{ ok: true }}
        decks={sampleDecks}
        runs={[]}
        policies={[
          {
            policy_id: "B3 HeuristicPublicAggro",
            label: "B3 HeuristicPublicAggro",
            kind: "heuristic",
            selected_by_default: false,
          },
          {
            policy_id: "policy_000001",
            label: "Policy 1",
            kind: "snapshot",
            selected_by_default: false,
          },
        ]}
        runDir="runs/example"
        policyId="main_league_selected"
        spectateOpponentPolicyId="B3 HeuristicPublicAggro"
        modelSamplingAlgorithm="model_argmax_pinned_v1"
        humanDeck={sampleDecks[0].deck_id}
        modelDeck={sampleDecks[0].deck_id}
        humanSeat={0}
        seed={20260521}
        mode="spectate"
        searchEnabled={false}
        busy={false}
        error={null}
        onRunDirChange={vi.fn()}
        onPolicyIdChange={vi.fn()}
        onSpectateOpponentPolicyIdChange={vi.fn()}
        onModelSamplingAlgorithmChange={vi.fn()}
        onHumanDeckChange={vi.fn()}
        onModelDeckChange={vi.fn()}
        onHumanSeatChange={vi.fn()}
        onSeedChange={vi.fn()}
        onModeChange={vi.fn()}
        onSearchEnabledChange={vi.fn()}
        onCreate={vi.fn()}
        onRefreshCatalog={vi.fn()}
      />,
    );

    const opponentSelect = screen.getByRole("combobox", { name: "Opponent bot" });
    expect(within(opponentSelect).getByRole("option", { name: "Self-play / same policy" })).toBeInTheDocument();
    expect(within(opponentSelect).getByRole("option", { name: "B3 HeuristicPublicAggro" })).toBeInTheDocument();
    expect(within(opponentSelect).queryByRole("option", { name: "Policy 1" })).not.toBeInTheDocument();

    const samplerSelect = screen.getByRole("combobox", { name: "Sampler" });
    expect(within(samplerSelect).getByRole("option", { name: "Pinned CDF stochastic" })).toBeInTheDocument();
    expect(within(samplerSelect).getByRole("option", { name: "Deterministic argmax" })).toBeInTheDocument();
  });
});
