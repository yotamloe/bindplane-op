import { timeAgoInWords } from "./time";

describe("timeAgoInWords", () => {
  it("less than a minute", () => {
    const now = new Date();
    const words = timeAgoInWords(new Date(now.getTime() - 2 * 1000), now);

    expect(words).toEqual("less than a minute");
  });
  it("1 day", () => {
    const now = new Date();
    const words = timeAgoInWords(
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
      now
    );

    expect(words).toEqual("1 day");
  });
});
