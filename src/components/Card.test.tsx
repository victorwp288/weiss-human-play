import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardFace } from "./Card";

describe("CardFace", () => {
  it("shows climax soul instead of hiding the printed stat line", () => {
    render(
      <CardFace
        card={{
          name: "Choice Climax",
          card_no: "5HY/W90-CC",
          card_type: "climax",
          color: "green",
          soul: 2,
        }}
      />,
    );

    expect(screen.getByText("CLIMAX")).toBeInTheDocument();
    expect(screen.getByTitle("Printed 2 soul")).toBeInTheDocument();
  });

  it("prefers current stats when the simulator exposes them", () => {
    render(
      <CardFace
        card={{
          name: "Powered Yotsuba",
          card_no: "5HY/W90-001",
          card_type: "character",
          color: "green",
          power: 4500,
          current_power: 5500,
          soul: 1,
          current_soul: 2,
        }}
      />,
    );

    expect(screen.getByText("5500")).toBeInTheDocument();
    expect(screen.getByTitle("Current 2 soul")).toBeInTheDocument();
  });
});
