import { render } from "@testing-library/react";
import { renderInvalidReason } from "./renderInvalidReason";
import renderer from "react-test-renderer";

const REASON = `1 error occurred:\n* unable to parse spec.raw as yaml: yaml: line 9: could not find expected ':'`;

describe("renderInvalidReason", () => {
  it("renders without error", () => {
    render(<>{renderInvalidReason(REASON)}</>);
  });

  it("matches snapshot", () => {
    const tree = renderer.create(<>{renderInvalidReason(REASON)}</>);

    expect(tree).toMatchSnapshot();
  });
});
