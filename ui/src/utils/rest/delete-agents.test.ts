import { deleteAgents } from "./delete-agents";
import nock from "nock";

describe("deleteAgents", () => {
  it("calls the correct endpoint", async () => {
    let endpointCalled = false;
    nock("http://localhost:80")
      .delete("/v1/agents", (body) => {
        endpointCalled = true;
        return true;
      })
      .reply(200, {
        agents: [],
      });

    await deleteAgents(["some-id"]);

    expect(endpointCalled).toEqual(true);
  });

  it("passes agent IDs in the payload", async () => {
    const ids = ["1", "2", "3"];

    let gotIds: string[] = [];

    nock("http://localhost:80")
      .delete("/v1/agents", (body) => {
        gotIds = body.ids;
        return true;
      })
      .reply(200, {
        agents: [],
      });

    await deleteAgents(ids);

    expect(gotIds).toEqual(ids);
  });

  it("throws error for non 200 status", async () => {
    nock("http://localhost:80")
      .delete("/v1/agents", (body) => {
        return true;
      })
      .reply(500, {
        agents: [],
      });

    let errorCaught = false;
    try {
      await deleteAgents(["1"]);
    } catch (err) {
      errorCaught = true;
    }

    expect(errorCaught).toEqual(true);
  });
});
