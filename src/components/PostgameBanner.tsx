import { BarChart3, Crown, Trophy } from "lucide-react";

import { cx, zoneCount } from "../format";
import type { PlayerView, SessionState } from "../types";

type WinnerCopy = {
  title: string;
  subtitle: string;
  tone: "win" | "loss" | "neutral";
};

export function PostgameBanner({ state }: { state: SessionState }) {
  if (!state.terminal) {
    return null;
  }

  const result = state.result ?? {};
  const winnerSeat = numberValue(result.winner_seat);
  const copy = winnerCopy(state, winnerSeat);
  const top = playerForSeat(state, state.model_seat);
  const bottom = playerForSeat(state, state.human_seat);
  const topLabel = state.spectate ? "Primary bot" : "Opponent";
  const bottomLabel = state.spectate ? "Opponent bot" : "You";
  const actionSummary = objectEntries(result.action_summary);

  return (
    <section className={cx("postgame", `postgame--${copy.tone}`)} aria-label="Match result">
      <div className="postgame__main" role="status">
        <span className="postgame__seal" aria-hidden>
          {copy.tone === "win" ? <Trophy size={28} /> : <Crown size={28} />}
        </span>
        <div className="postgame__copy">
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <details className="postgame__stats">
        <summary>
          <BarChart3 size={16} aria-hidden />
          Match stats
        </summary>
        <div className="postgame__grid">
          <Stat label="Winner seat" value={winnerSeat == null ? "Unknown" : `Seat ${winnerSeat}`} />
          <Stat label="Decisions" value={stringValue(result.decision_count ?? state.view.summary?.decision_count)} />
          <Stat label="Ended by" value={stringValue(result.termination_reason ?? "terminal")} />
          <Stat label={topLabel} value={playerLine(top)} />
          <Stat label={bottomLabel} value={playerLine(bottom)} />
          <Stat label="Visible log" value={`${state.history?.length ?? 0} public actions`} />
          <Stat label="Primary policy" value={policyForSeat(state, state.model_seat)} />
          <Stat label="Opponent policy" value={policyForSeat(state, state.human_seat)} />
        </div>
        {actionSummary.length ? (
          <div className="postgame__actions" aria-label="Action summary">
            {actionSummary.slice(0, 8).map(([key, value]) => (
              <span key={key}>
                <b>{humanizeKey(key)}</b>
                <strong>{String(value)}</strong>
              </span>
            ))}
          </div>
        ) : null}
      </details>
    </section>
  );
}

function winnerCopy(state: SessionState, winnerSeat: number | null): WinnerCopy {
  if (winnerSeat == null) {
    return {
      title: "Match complete",
      subtitle: "The simulator reached a terminal state, but no winner seat was reported.",
      tone: "neutral",
    };
  }
  if (state.spectate) {
    if (winnerSeat === state.model_seat) {
      return {
        title: "Primary bot wins",
        subtitle: `Seat ${winnerSeat} closed it out with ${policyForSeat(state, winnerSeat)}.`,
        tone: "win",
      };
    }
    if (winnerSeat === state.human_seat) {
      return {
        title: "Opponent bot wins",
        subtitle: `Seat ${winnerSeat} closed it out with ${policyForSeat(state, winnerSeat)}.`,
        tone: "loss",
      };
    }
  }
  if (winnerSeat === state.human_seat) {
    return {
      title: "You win",
      subtitle: `Seat ${winnerSeat} won the match.`,
      tone: "win",
    };
  }
  if (winnerSeat === state.model_seat) {
    return {
      title: "You lose",
      subtitle: `Seat ${winnerSeat} won the match.`,
      tone: "loss",
    };
  }
  return {
    title: `Seat ${winnerSeat} wins`,
    subtitle: "The simulator reported a winner outside the current viewer seats.",
    tone: "neutral",
  };
}

function playerForSeat(state: SessionState, seat: number): PlayerView | undefined {
  return state.view.players?.find((player) => Number(player.seat) === Number(seat));
}

function policyForSeat(state: SessionState, seat: number): string {
  if (seat === 0 && state.seat0_policy_id) {
    return state.seat0_policy_id;
  }
  if (seat === 1 && state.seat1_policy_id) {
    return state.seat1_policy_id;
  }
  if (seat === state.model_seat) {
    return state.policy_id;
  }
  return state.spectate_opponent_policy_id ?? "human";
}

function playerLine(player: PlayerView | undefined): string {
  return `Lv ${zoneCount(player, "level")} / Clock ${zoneCount(player, "clock")} / Stock ${zoneCount(player, "stock")}`;
}

function numberValue(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function stringValue(value: unknown): string {
  if (value == null || value === "") {
    return "Unknown";
  }
  return String(value);
}

function objectEntries(value: unknown): Array<[string, unknown]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  return Object.entries(value as Record<string, unknown>).filter(([, item]) => item != null);
}

function humanizeKey(key: string): string {
  return key.replace(/_/g, " ");
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="postgame__stat">
      <b>{label}</b>
      <strong>{value}</strong>
    </span>
  );
}
