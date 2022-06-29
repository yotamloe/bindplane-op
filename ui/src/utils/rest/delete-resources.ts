import { ResourceKind } from "../../types/resources";
import { DeletePayload, DeleteResponse } from "../../types/rest";

export interface MinimumDeleteResource {
  metadata: {
    name: string;
  };
  kind: ResourceKind;
}

/**
 * deleteResources POSTS to /v1/delete with the specified resources and
 * throws an error if response status is not 202.
 */
export async function deleteResources(
  resources: MinimumDeleteResource[]
): Promise<DeleteResponse> {
  const payload: DeletePayload = {
    resources,
  };

  const resp = await fetch("/v1/delete", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (resp.status !== 202) {
    throw new Error("Failed to delete resources,");
  }

  return (await resp.json()) as DeleteResponse;
}
