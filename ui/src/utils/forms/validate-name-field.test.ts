import { validateNameField } from "./validate-name-field";

describe("validateNameField", () => {
  it("bad characters", () => {
    const badCharacters = ["Corbin'sMacbook", "som@thing"];

    for (const name of badCharacters) {
      const error = validateNameField(name);
      expect(error).toEqual(
        "Invalid character. Can contain alphanumeric characters, dashes ( - ), underscores ( _ ), and dots ( . )."
      );
    }
  });

  it("cannot start or ends with - or _", () => {
    const badNames = ["-check", "check-", "_check", "check_"];

    for (const name of badNames) {
      expect(validateNameField(name)).toEqual(
        "Must begin and end with an alphanumeric character."
      );
    }
  });
});
