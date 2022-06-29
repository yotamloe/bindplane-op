import { render, screen } from "@testing-library/react";
import { ConfigurationsTable } from ".";
import { MemoryRouter } from "react-router-dom";
import nock from "nock";
import { ApolloProvider } from "@apollo/client";
import APOLLO_CLIENT from "../../../apollo-client";
import {
  Configuration,
  GetConfigurationTableQuery,
} from "../../../graphql/generated";

const TEST_CONFIGS: Pick<Configuration, "metadata">[] = [
  {
    metadata: {
      id: "1",
      name: "config-1",
      description: "description for config-1",
      labels: {
        env: "test",
        foo: "bar",
      },
    },
  },
  {
    metadata: {
      id: "2",
      name: "config-2",
      description: "description for config-2",
      labels: {
        env: "test",
        foo: "bar",
      },
    },
  },
];

const QUERY_RESULT: GetConfigurationTableQuery = {
  configurations: {
    configurations: TEST_CONFIGS,
    query: "",
    suggestions: [],
  },
};

beforeEach(() => {
  nock("http://localhost:80")
    .post("/v1/graphql", (body) => {
      return body.operationName === "GetConfigurationTable";
    })
    .once()
    .reply(200, {
      data: QUERY_RESULT,
    });
});

describe("ConfigurationsTable", () => {
  it("renders rows of configurations", async () => {
    render(
      <MemoryRouter>
        <ApolloProvider client={APOLLO_CLIENT}>
          <ConfigurationsTable />
        </ApolloProvider>
      </MemoryRouter>
    );

    const rowOne = await screen.findByText("config-1");
    expect(rowOne).toBeInTheDocument();
    const rowTwo = await screen.findByText("config-2");
    expect(rowTwo).toBeInTheDocument();
  });

  it("shows delete button after selecting row", async () => {
    render(
      <MemoryRouter>
        <ApolloProvider client={APOLLO_CLIENT}>
          <ConfigurationsTable />
        </ApolloProvider>
      </MemoryRouter>
    );

    // sanity check
    const row1 = await screen.findByText("config-1");
    expect(row1).toBeInTheDocument();

    const checkbox = await screen.findByLabelText("Select all rows");
    checkbox.click();

    const deleteButton = await screen.findByText("Delete 2 Configurations");
    expect(deleteButton).toBeInTheDocument();
  });

  it("opens the delete dialog after clicking delete", async () => {
    render(
      <MemoryRouter>
        <ApolloProvider client={APOLLO_CLIENT}>
          <ConfigurationsTable />
        </ApolloProvider>
      </MemoryRouter>
    );

    const row1 = await screen.findByText("config-1");
    expect(row1).toBeInTheDocument();

    const checkbox = await screen.findByLabelText("Select all rows");
    checkbox.click();

    const deleteButton = await screen.findByText("Delete 2 Configurations");
    deleteButton.click();

    const dialog = await screen.findByTestId("delete-dialog");
    expect(dialog).toBeInTheDocument();
  });
});
