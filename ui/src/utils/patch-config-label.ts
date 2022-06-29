import { PatchLabelsPayload, PatchLabelsResponse } from "../types/rest";

export async function patchConfigLabel(
  agentId: string,
  configLabel: string
): Promise<PatchLabelsResponse> {
  const url = `/v1/agents/${agentId}/labels?overwrite=true`;
  const body: PatchLabelsPayload = {
    labels: {
      configuration: configLabel,
    },
  };

  const resp = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return (await resp.json()) as PatchLabelsResponse;
}
