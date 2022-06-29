import { render, screen } from "@testing-library/react";
import { NavBar } from ".";
import { MemoryRouter } from "react-router-dom";
import renderer from "react-test-renderer";

describe("NavBar", () => {
  it("main navigation", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const agentsButton = screen.getByText("Agents");
    expect(agentsButton).toBeInTheDocument();
    expect(agentsButton).toHaveAttribute("href", "/agents");

    const configurationsButton = screen.getByText("Configs");
    expect(configurationsButton).toBeInTheDocument();
    expect(configurationsButton).toHaveAttribute("href", "/configurations");
  });

  it("sub navigation", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const docLink = screen.getByTestId("doc-link");
    expect(docLink).toHaveAttribute(
      "href",
      "https://docs.bindplane.observiq.com/docs"
    );

    const supportLink = screen.getByTestId("support-link");
    expect(supportLink).toHaveAttribute("href", "mailto:support@observiq.com");

    const slackLink = screen.getByTestId("slack-link");
    expect(slackLink).toHaveAttribute(
      "href",
      "https://observiq.com/support-bindplaneop/"
    );
  });

  it("displays settings menu", () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    const settingsButton = screen.getByTestId("settings-button");
    expect(settingsButton).toBeInTheDocument();

    settingsButton.click();

    const logoutButton = screen.getByText("Logout");
    expect(logoutButton).toBeInTheDocument();
  });

  it("renders correctly", () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
