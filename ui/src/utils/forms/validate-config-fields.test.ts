import { newConfiguration } from "../resources";
import { validateFields } from "./validate-config-fields";

describe("validateFields", () => {
  it("valid names", () => {
    const validNames: string[] = [
      "good",
      "this-works",
      "and.this",
      "12345",
      "check123",
      "123check",
      "1",
    ];

    for (const name of validNames) {
      const errors = validateFields({
        name,
        description: "",
        platform: "linux",
        rawConfig: "raw-config",
        fileName: "",
      });
      expect(errors.name).toBeNull();
    }
  });
  it("invalid names", () => {
    const invalidNames: string[] = ["_bad", "bad_", "has space"];
    for (const name of invalidNames) {
      const errors = validateFields({
        name,
        description: "",
        platform: "linux",
        rawConfig: "raw-config",
        fileName: "",
      });
      expect(errors.name).not.toBeNull();
    }
  });
  it("name between 0 and 63 characters long", () => {
    let good = "";
    for (let i = 0; i < 63; i++) {
      good += "a";
    }

    let errors = validateFields({
      name: good,
      description: "",
      platform: "linux",
      rawConfig: "raw-config",
      fileName: "",
    });

    expect(errors.name).toBeNull();

    let bad = "";
    for (let i = 0; i < 64; i++) {
      bad += "a";
    }

    errors = validateFields({
      name: bad,
      description: "",
      platform: "linux",
      rawConfig: "raw-config",
      fileName: "",
    });

    expect(errors.name).not.toBeNull();
  });

  it("platform must be non empty", () => {
    const errors = validateFields({
      name: "test",
      description: "",
      platform: "",
      rawConfig: "# raw-config",
      fileName: "",
    });

    expect(errors.platform).not.toBeNull();
  });

  it("sets error if configuration name is taken", () => {
    const testConfig = newConfiguration({
      name: "test",
      description: "",
      spec: {},
      labels: {},
    });
    const errors = validateFields(
      {
        name: "test",
        description: "",
        platform: "",
        rawConfig: "# raw-config",
        fileName: "",
      },
      [testConfig]
    );

    expect(errors.name).not.toBeNull();
  });

  it("no error if config name is not taken", () => {
    const testConfig = newConfiguration({
      name: "test",
      description: "",
      spec: {},
      labels: {},
    });
    const errors = validateFields(
      {
        name: "blah",
        description: "",
        platform: "",
        rawConfig: "# raw-config",
        fileName: "",
      },
      [testConfig]
    );

    expect(errors.name).toBeNull();
  });
});
