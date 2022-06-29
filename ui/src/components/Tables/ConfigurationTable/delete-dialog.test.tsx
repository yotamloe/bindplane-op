import nock from "nock";
import { APIVersion, ResourceKind, UpdateStatus } from "../../../types/resources";
import { DeleteResponse } from "../../../types/rest";
import { DeleteDialog } from "./DeleteDialog";
import { render, screen, waitFor } from "@testing-library/react";

const DELETE_RESPONSE: DeleteResponse = {
  updates: [
    {
      status: UpdateStatus.DELETED,
      resource: {
        metadata: { name: "config-1", id: "uuid" },
        kind: ResourceKind.CONFIGURATION,
        spec: {},
        apiVersion: APIVersion.V1_BETA,
      },
    },
  ],
};

describe("DeleteDialog", () => {
  it("posts to /v1/delete", async () => {
    const scope = nock("http://localhost:80")
      .post("/v1/delete", () => true)
      .once()
      .reply(202, DELETE_RESPONSE);

    render(
      <DeleteDialog
        open={true}
        onClose={() => {}}
        onDeleteSuccess={() => {}}
        selected={["config-1"]}
      />
    );

    const deleteButton = screen.getByText("Delete");
    deleteButton.click();

    await waitFor(() => expect(scope.isDone()).toEqual(true));
  });

  it("calls onDeleteSuccess on successful delete", async () => {
    let onDeleteSuccessCalled = false;
    function onDeleteSuccess() {
      onDeleteSuccessCalled = true;
    }

    nock("http://localhost:80")
      .post("/v1/delete", () => true)
      .once()
      .reply(202, DELETE_RESPONSE);

    render(
      <DeleteDialog
        open={true}
        onClose={() => {}}
        onDeleteSuccess={onDeleteSuccess}
        selected={["config-1"]}
      />
    );

    const deleteButton = screen.getByText("Delete");
    deleteButton.click();

    await waitFor(() => expect(onDeleteSuccessCalled).toEqual(true));
  });
});
