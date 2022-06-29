import { render, screen } from "@testing-library/react";
import nock from "nock";
import { UpdateStatus } from "../../../types/resources";
import { ConfigurationSection } from "./ConfigurationSection";
import { initQuery } from "./utils";

const CONFIG = {
  __typename: "Configuration" as "Configuration",
  metadata: {
    __typename: "Metadata" as "Metadata",
    id: "test-config",
    name: "test-config",
    description: "",
    labels: {
      platform: "linux",
    },
  },
  spec: {
    __typename: "ConfigurationSpec" as "ConfigurationSpec",
    raw: `receivers:
    hostmetrics:
    scrapers:
        cpu:
exporters:
    logging:
service:
    pipelines:
    metrics:
        receivers: [hostmetrics]
        exporters: [logging]
`,
  },
};

describe("ConfigurationSection", () => {
  it("displays invalid reason when receiving status invalid after save", async () => {
    render(
      <ConfigurationSection
        configuration={CONFIG}
        refetch={() => {}}
        onSaveSuccess={() => {}}
        onSaveError={() => {}}
      />
    );

    const invalidReasonText = "REASON_INVALID";

    nock("http://localhost:80")
      .post("/v1/apply", (body) => {
        return true;
      })
      .once()
      .reply(202, {
        updates: [
          {
            resource: { metadata: { name: "test-config" } },
            status: UpdateStatus.INVALID,
            reason: invalidReasonText,
          },
        ],
      });

    screen.getByTestId("edit-configuration-button").click();
    screen.getByTestId("save-button").click();

    await screen.findByText(invalidReasonText);
  });
});

describe("initQuery", () => {
  it("configuration=blah, platform=macos", () => {
    const expectQuery = "-configuration:blah platform:darwin";
    const gotQuery = initQuery({ configuration: "blah" }, "macos");

    expect(gotQuery).toEqual(expectQuery);
  });

  it("configuration=blah, platform=linux", () => {
    const expectQuery = "-configuration:blah platform:linux";
    const gotQuery = initQuery({ configuration: "blah" }, "linux");

    expect(gotQuery).toEqual(expectQuery);
  });

  it("configuration=blah, platform=windows", () => {
    const expectQuery = "-configuration:blah platform:windows";
    const gotQuery = initQuery({ configuration: "blah" }, "windows");

    expect(gotQuery).toEqual(expectQuery);
  });

  it("configuration=blah, platform=undefined", () => {
    const expectQuery = "-configuration:blah";
    const gotQuery = initQuery({ configuration: "blah" }, undefined);

    expect(gotQuery).toEqual(expectQuery);
  });
});
