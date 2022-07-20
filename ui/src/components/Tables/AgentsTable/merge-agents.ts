import {
  AgentChange,
  AgentChangeType,
  AgentsTableQuery
} from "../../../graphql/generated";

// mergeAgents updates applies the updates to the list of current agents, replacing existing agents that are updated,
// adding new agents that are added, and removing agents that are removed.
export function mergeAgents(
  currentAgents: AgentsTableQuery["agents"]["agents"],
  agentUpdates: AgentChange[] | undefined
): AgentsTableQuery["agents"]["agents"] {
  let newAgents: AgentsTableQuery["agents"]["agents"] = [...currentAgents];

  for (const agentUpdate of agentUpdates || []) {
    switch (agentUpdate.changeType) {
      case AgentChangeType.Insert:
        // Do not insert if agent is already present
        // this can happen when many messages come in at once
        if (currentAgents.some((a) => a.id === agentUpdate.agent.id)) {
          break;
        }

        newAgents.push(agentUpdate.agent);
        break;
      case AgentChangeType.Remove:
        newAgents = newAgents.filter((a) => a.id !== agentUpdate.agent.id);
        break;
      case AgentChangeType.Update:
        const replaceIndex = newAgents.findIndex(
          (a) => a.id === agentUpdate.agent.id
        );

        // Replace an existing agent if we found one
        if (replaceIndex > -1) {
          newAgents[replaceIndex] = agentUpdate.agent;
        } else {
          // Add the agent, this can happen if an agents labels get updated
          // and now fit the current selector
          newAgents.push(agentUpdate.agent);
        }
    }
  }

  return newAgents;
}
