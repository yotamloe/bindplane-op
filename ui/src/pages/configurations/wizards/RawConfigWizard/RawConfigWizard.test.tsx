import { ApolloProvider } from "@apollo/client";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import nock from "nock";
import { SnackbarProvider } from "notistack";
import { MemoryRouter } from "react-router-dom";
import { DEFAULT_RAW_CONFIG, RawConfigWizard } from ".";
import APOLLO_CLIENT from "../../../../apollo-client";
import { RawConfigFormValues } from "../../../../types/forms";
import { UpdateStatus } from "../../../../types/resources";
import { ApplyPayload } from "../../../../types/rest";
import { newConfiguration } from "../../../../utils/resources";

describe("RawConfigForm", () => {
  const initFormValues: RawConfigFormValues = {
    name: "test",
    description: "test-description",
    rawConfig: "raw:",
    platform: "macos",
    fileName: "",
  };

  it("populates inputs correctly from initialValues", () => {
    const initFormValues: RawConfigFormValues = {
      name: "test",
      description: "test-description",
      rawConfig: "raw:",
      platform: "macos",
      fileName: "",
    };

    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <SnackbarProvider>
          <MemoryRouter>
            <RawConfigWizard
              initialValues={initFormValues}
              onSuccess={() => {}}
            />
          </MemoryRouter>
        </SnackbarProvider>
      </ApolloProvider>
    );

    // Correct value for name input
    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
    expect(nameInput.value).toEqual("test");
    // Correct value for description input
    const descriptionInput = screen.getByLabelText(
      "Description"
    ) as HTMLInputElement;
    expect(descriptionInput.value).toEqual("test-description");

    // A little clunky, but verify that macOS is selected by
    // getting its text.
    expect(screen.getByText("macOS")).toBeInTheDocument();
  });

  it("renders correct copy when fromInput=true", () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <MemoryRouter>
          <SnackbarProvider>
            <RawConfigWizard
              initialValues={initFormValues}
              fromImport={true}
              onSuccess={() => {}}
            />
          </SnackbarProvider>
        </MemoryRouter>
      </ApolloProvider>
    );
    // Step one copy
    expect(
      screen.getByText(
        "We've provided some basic details for this configuration, just verify everything looks correct."
      )
    ).toBeInTheDocument();

    screen.getByTestId("step-one-next").click();

    // Step two copy
    expect(
      screen.getByText(
        "This is the configuration of the connected agent. If everything looks good, click Save to complete your import."
      )
    ).toBeInTheDocument();

    const uploadButton = screen.queryByTestId("file-input");
    expect(uploadButton).not.toBeInTheDocument();
  });

  it("will block going to step two if fields aren't valid", () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <MemoryRouter>
          <RawConfigWizard onSuccess={() => {}} />
        </MemoryRouter>
      </ApolloProvider>
    );

    expect(screen.getByTestId("step-one")).toBeInTheDocument();
    screen.getByText("Next").click();

    expect(screen.getByTestId("step-one")).toBeInTheDocument();
  });

  it("can navigate to step two with valid form values", () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <SnackbarProvider>
          <MemoryRouter>
            <RawConfigWizard onSuccess={() => {}} />
          </MemoryRouter>
        </SnackbarProvider>
      </ApolloProvider>
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "test" },
    });

    fireEvent.mouseDown(screen.getByLabelText("Platform"));
    screen.getByText("Windows").click();

    screen.getByText("Next").click();

    expect(screen.getByTestId("step-two")).toBeInTheDocument();
  });

  it("contains correct doc links", () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <SnackbarProvider>
          <MemoryRouter>
            <RawConfigWizard onSuccess={() => {}} />
          </MemoryRouter>
        </SnackbarProvider>
      </ApolloProvider>
    );

    expect(screen.getByText("sample files")).toHaveAttribute(
      "href",
      "https://github.com/observIQ/observiq-otel-collector/tree/main/config/google_cloud_exporter"
    );
    expect(screen.getByText("OpenTelemetry documentation")).toHaveAttribute(
      "href",
      "https://opentelemetry.io/docs/collector/configuration/"
    );
  });

  it("persists form data between steps", () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <SnackbarProvider>
          <MemoryRouter>
            <RawConfigWizard onSuccess={() => {}} />
          </MemoryRouter>
        </SnackbarProvider>
      </ApolloProvider>
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "test" },
    });

    fireEvent.mouseDown(screen.getByLabelText("Platform"));
    screen.getByText("Linux").click();

    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "This is the description text." },
    });

    screen.getByText("Next").click();
    expect(screen.getByTestId("step-two")).toBeInTheDocument();

    screen.getByText("Back").click();
    expect(screen.getByTestId("step-one")).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toHaveValue("test");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "This is the description text."
    );
    expect(screen.getByText("Linux")).toBeInTheDocument();
  });

  it("displays the expected default config", () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <MemoryRouter>
          <SnackbarProvider>
            <RawConfigWizard onSuccess={() => {}} />
          </SnackbarProvider>
        </MemoryRouter>
      </ApolloProvider>
    );

    goToStepTwo();
    const editor = screen.getByTestId("yaml-editor");
    expect(editor).toHaveValue(DEFAULT_RAW_CONFIG);
  });

  it("posts the correct data to /v1/apply", async () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <MemoryRouter>
          <SnackbarProvider>
            <RawConfigWizard onSuccess={() => {}} />
          </SnackbarProvider>
        </MemoryRouter>
      </ApolloProvider>
    );

    // Rest Mock for POST /apply
    const restScope = nock("http://localhost:80")
      .post("/v1/apply", (body: ApplyPayload) => {
        gotApplyBody = body;
        return true;
      })
      .once()
      .reply(202, {
        updates: [
          {
            resource: { metadata: { name: "test" } },
            status: UpdateStatus.CREATED,
          },
        ],
      });

    let gotApplyBody: ApplyPayload = { resources: [] };
    // GQL Mock for getConfigNamesQuery
    nock("http://localhost")
      .post("/v1/graphql", (body) => true)
      .reply(200, { data: { configurations: [] } });

    // Make sure config names query is called
    await waitFor(
      () =>
        !restScope.activeMocks().includes("POST http://localhost:80/v1/graphql")
    );

    goToStepTwo();

    const expectConfig = newConfiguration({
      name: "test",
      description: "",
      spec: {
        selector: { matchLabels: { configuration: "test" } },
        raw: "raw-config",
      },
      labels: { platform: "linux" },
    });

    const textarea = screen.getByTestId("yaml-editor");

    fireEvent.change(textarea, {
      target: { value: "raw-config" },
    });

    const saveButton = screen.getByText("Save");
    expect(saveButton).not.toBeDisabled();

    saveButton.click();

    await waitFor(() => {
      return expect(restScope.isDone()).toEqual(true);
    });
    expect(gotApplyBody).toStrictEqual({ resources: [expectConfig] });
  });

  it("can upload a file", async () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <MemoryRouter>
          <SnackbarProvider>
            <RawConfigWizard onSuccess={() => {}} />
          </SnackbarProvider>
        </MemoryRouter>
      </ApolloProvider>
    );

    goToStepTwo();

    const file: File = new File(["(⌐□_□)"], "raw-config.yaml");

    const fileInput = screen.getByTestId("file-input");
    expect(fileInput).not.toBeVisible();

    fireEvent.change(fileInput, { target: { files: [file] } });

    const fileChip = await screen.findByText("raw-config.yaml");
    expect(fileChip).toBeInTheDocument();

    screen.getByDisplayValue("(⌐□_□)");
  });

  it("calls onSuccess when apply is successful", async () => {
    let onSuccessCalled = false;

    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <MemoryRouter>
          <SnackbarProvider>
            <RawConfigWizard
              initialValues={initFormValues}
              onSuccess={() => {
                onSuccessCalled = true;
              }}
            />{" "}
          </SnackbarProvider>
        </MemoryRouter>
      </ApolloProvider>
    );

    nock("http://localhost:80")
      .post("/v1/apply", (body) => {
        return true;
      })
      .once()
      .reply(202, {
        updates: [
          {
            resource: { metadata: { name: "test" } },
            status: UpdateStatus.CREATED,
          },
        ],
      });

    nock("http://localhost")
      .post("/v1/graphql", (body) => true)
      .reply(200, { data: { configurations: [] } });

    screen.getByTestId("step-one-next").click();
    screen.getByTestId("save-button").click();

    await waitFor(() => expect(onSuccessCalled).toEqual(true));
  });

  it("calls onSuccess when apply is successful in import mode", async () => {
    let onSuccessCalled = false;

    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <MemoryRouter>
          <SnackbarProvider>
            <RawConfigWizard
              initialValues={initFormValues}
              fromImport={true}
              onSuccess={() => {
                onSuccessCalled = true;
              }}
            />
          </SnackbarProvider>
        </MemoryRouter>
      </ApolloProvider>
    );

    nock("http://localhost:80")
      .post("/v1/apply", (body) => {
        return true;
      })
      .once()
      .reply(202, {
        updates: [
          {
            resource: { metadata: { name: "test" } },
            status: UpdateStatus.CREATED,
          },
        ],
      });

    nock("http://localhost")
      .patch(`/v1/agents/labels`, (body) => true)
      .once()
      .reply(200, { errors: [] });

    nock("http://localhost")
      .post("/v1/graphql", (body) => true)
      .reply(200, { data: { configurations: [] } });

    screen.getByTestId("step-one-next").click();
    screen.getByTestId("save-button").click();

    await waitFor(() => expect(onSuccessCalled).toEqual(true));
  });

  it("displays reason when apply returns update status invalid", async () => {
    render(
      <ApolloProvider client={APOLLO_CLIENT}>
        <MemoryRouter>
          <SnackbarProvider>
            <RawConfigWizard
              initialValues={initFormValues}
              fromImport={true}
              onSuccess={() => {}}
            />
          </SnackbarProvider>
        </MemoryRouter>
      </ApolloProvider>
    );

    const invalidReasonText = "REASON_INVALID";

    nock("http://localhost")
      .post("/v1/graphql", (body) => true)
      .reply(200, { data: { configurations: [] } });

    nock("http://localhost:80")
      .post("/v1/apply", (body) => {
        return true;
      })
      .once()
      .reply(202, {
        updates: [
          {
            resource: { metadata: { name: "test" } },
            status: UpdateStatus.INVALID,
            reason: invalidReasonText,
          },
        ],
      });

    screen.getByTestId("step-one-next").click();
    screen.getByTestId("save-button").click();

    await screen.findByText(invalidReasonText);
  });
});

function goToStepTwo() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "test" },
  });

  fireEvent.mouseDown(screen.getByLabelText("Platform"));
  screen.getByText("Linux").click();

  screen.getByText("Next").click();
  expect(screen.getByTestId("step-two")).toBeInTheDocument();
}
