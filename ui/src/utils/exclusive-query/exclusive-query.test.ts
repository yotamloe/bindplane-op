import { exclusiveQueryFromLabels } from ".";

describe("exclusiveQueryFromLabels", () => {
  it("configuration=blah", () => {
    const query = exclusiveQueryFromLabels({ configuration: "blah" });
    expect(query).toEqual("-configuration:blah");
  });

  it("app=prod,cluster=kube", () => {
    const query = exclusiveQueryFromLabels({ app: "prod", cluster: "kube" });
    expect(query).toEqual("-app:prod -cluster:kube");
  });

  it("empty", () => {
    const query = exclusiveQueryFromLabels({});
    expect(query).toEqual("");
  });
});
