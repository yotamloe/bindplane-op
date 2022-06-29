import { render, screen } from "@testing-library/react";
import { App } from "./app";

describe("App", () => {
  it("renders the bindplane logo", () => {
    render(<App />);
    screen.getByLabelText("bindplane-logo");
  });
});
