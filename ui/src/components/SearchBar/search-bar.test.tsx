import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from ".";
import { Suggestion } from "../../graphql/generated";

describe("SearchBar", () => {
  const filterOptions: Suggestion[] = [
    { label: "Disconnected agents", query: "status:disconnected" },
    { label: "Outdated agents", query: "-version:latest" },
    { label: "No managed configuration", query: "-configuration:" },
  ];
  it("when filterOptions are passed shows a filter dropdown that changes the input", () => {
    render(
      <SearchBar onQueryChange={() => {}} filterOptions={filterOptions} />
    );

    const input = screen.getByRole("combobox");

    screen.getByText("Filters").click();
    screen.getByText("Disconnected agents").click();
    expect(input).toHaveValue("status:disconnected");

    screen.getByText("Filters").click();
    screen.getByText("Outdated agents").click();
    expect(input).toHaveValue("-version:latest");

    screen.getByText("Filters").click();
    screen.getByText("No managed configuration").click();
    expect(input).toHaveValue("-configuration:");
  });
  it("calls onQueryChange when search input changes suggestions", () => {
    let count = 0;
    function onQueryChange(v: string) {
      count++;
    }

    render(
      <SearchBar onQueryChange={onQueryChange} filterOptions={filterOptions} />
    );

    expect(count).toEqual(0);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "test" } });

    // From User Input
    expect(input).toHaveValue("test");
    expect(count).toEqual(1);

    // From Filter selection
    screen.getByText("Filters").click();
    screen.getByText("Disconnected agents").click();
    expect(count).toEqual(2);
  });

  const suggestions: Suggestion[] = [
    { query: "bar:baz foo:", label: "foo:" },
    { query: "bar:baz food:", label: "food:" },
    { query: "bar:baz found:", label: "found:" },
  ];
  it("displays suggestions", () => {
    render(
      <SearchBar
        onQueryChange={() => {}}
        suggestionQuery="foo"
        suggestions={suggestions}
      />
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "foo" },
    });

    expect(screen.getByText("foo:")).toBeInTheDocument();
    expect(screen.getByText("food:")).toBeInTheDocument();
    expect(screen.getByText("found:")).toBeInTheDocument();
  });

  it("does not display suggestions when the search does not match the suggestionQuery", () => {
    render(
      <SearchBar
        onQueryChange={() => {}}
        suggestionQuery="baz"
        suggestions={suggestions}
      />
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "foo" },
    });

    expect(screen.queryByText("foo:")).not.toBeInTheDocument();
    expect(screen.queryByText("food:")).not.toBeInTheDocument();
    expect(screen.queryByText("found:")).not.toBeInTheDocument();
  });

  it("fills the combobox with the suggestion query on selection", () => {
    render(
      <SearchBar
        onQueryChange={() => {}}
        suggestionQuery="foo"
        suggestions={suggestions}
      />
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "foo" },
    });

    const option1 = screen.getByText("found:");
    expect(option1).toBeInTheDocument();

    option1.click();

    expect(screen.getByRole("combobox")).toHaveValue("bar:baz found:");
  });
});
