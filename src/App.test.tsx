import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { createSession, getDecks, getHealth, getPolicies, getRuns } from "./api";
import { sampleDecks, sampleSession } from "./test/fixtures";

vi.mock("./api", async () => {
  const actual = await vi.importActual<typeof import("./api")>("./api");
  return {
    ...actual,
    closeSession: vi.fn(),
    createSession: vi.fn(),
    getDecks: vi.fn(),
    getHealth: vi.fn(),
    getPolicies: vi.fn(),
    getRuns: vi.fn(),
    getSession: vi.fn(),
    stepSession: vi.fn(),
    submitAction: vi.fn(),
  };
});

const mockedCreateSession = vi.mocked(createSession);
const mockedGetDecks = vi.mocked(getDecks);
const mockedGetHealth = vi.mocked(getHealth);
const mockedGetPolicies = vi.mocked(getPolicies);
const mockedGetRuns = vi.mocked(getRuns);

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockedGetHealth.mockResolvedValue({
      ok: true,
      weiss_sim: { available: true, human_decision_view: true, version: "1.2.0" },
    });
    mockedGetDecks.mockResolvedValue(sampleDecks);
    mockedGetRuns.mockResolvedValue([
      {
        run_dir: "/runs/main",
        name: "main",
        label: "main",
        modified_unix: 1,
        policy_count: 1,
        default_policy_id: "main_league_selected",
        has_config: true,
        has_registry: true,
        config_loadable: true,
      },
    ]);
    mockedGetPolicies.mockResolvedValue([]);
    mockedCreateSession.mockResolvedValue(sampleSession);
  });

  it("starts public matches with the stochastic eval sampler", async () => {
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: /start match/i }));

    await waitFor(() => expect(mockedCreateSession).toHaveBeenCalled());
    expect(mockedCreateSession.mock.calls[0][0].model_sampling_algorithm).toBe("pinned_cdf_pcg_v1");
  });
});
