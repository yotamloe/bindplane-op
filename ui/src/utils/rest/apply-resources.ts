import { Resource, ResourceStatus } from "../../types/resources";
import { ApplyPayload, ApplyResponse } from "../../types/rest";

/**
 * applyResources posts to the api apply endpoint.  It will throw an error
 * if response status is not 202.
 */
export async function applyResources(
  resources: Resource[]
): Promise<ApplyResponse> {
  const payload: ApplyPayload = {
    resources,
  };

  const resp = await fetch("/v1/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (resp.status !== 202) {
    throw new Error(`Failed to apply resources, status ${resp.status}.`);
  }

  return (await resp.json()) as ApplyResponse;
}

/**
 * getResourceStatusFromUpdates returns the resource status from updates that matches
 * the given name.  Can be undefined if update isn't present.
 */
export function getResourceStatusFromUpdates(
  updates: ApplyResponse["updates"],
  name: string
): ResourceStatus | undefined {
  return updates.find((u) => u.resource.metadata.name === name);
}
