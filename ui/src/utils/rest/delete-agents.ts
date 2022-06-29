import { Agent } from "../../graphql/generated";

interface DeleteAgentsPayload {
  ids: string[];
}

interface DeleteAgentsResponse {
  agents: Omit<Agent, "__typename">[];
}

const DELETE_ENDPOINT = "/v1/agents";

export async function deleteAgents(
  ids: string[]
): Promise<DeleteAgentsResponse> {
  const payload: DeleteAgentsPayload = {
    ids,
  };

  const resp = await fetch(DELETE_ENDPOINT, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });

  if (resp.status !== 200) {
    throw new Error("Failed to delete agents.");
  }

  return {
    agents: [],
  };
}
