import { LabelAgentsPayload, LabelAgentsResponse } from "../../types/rest";

/**
 * labelAgents Patches agent labels, returning errors or throwing if response is not 200 OK.
 * Returned errors could be because of conflicting labels or if an agent with specified ID does not exist.
 *
 * @param ids Agent Ids to apply
 * @param labels the labels to apply
 * @param overwrite should overwrite conflicting
 */
export async function labelAgents(
  ids: string[],
  labels: { [key: string]: string },
  overwrite: boolean = false
): Promise<string[]> {
  const body: LabelAgentsPayload = {
    ids,
    labels,
    overwrite,
  };

  try {
    const resp = await fetch("/v1/agents/labels", {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    const { errors } = (await resp.json()) as LabelAgentsResponse;
    return errors;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to patch agent labels.");
  }
}
