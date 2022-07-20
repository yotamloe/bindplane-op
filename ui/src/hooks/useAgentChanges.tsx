import { gql } from "@apollo/client";
import { useContext } from "react";
import { AgentChangesContext } from "../contexts/AgentChanges";
import { AgentChange } from "../graphql/generated";

gql`
  subscription AgentChanges($selector: String, $query: String, $seed: Boolean) {
    agentChanges(selector: $selector, query: $query, seed: $seed) {
      agentChanges {
        agent {
          id
          name
          version
          operatingSystem
          labels
          platform

          status

          configurationResource {
            apiVersion
            kind
            metadata {
              id
              name
            }
            spec {
              contentType
            }
          }
        }
        changeType
      }

      query

      suggestions {
        query
        label
      }
    }
  }
`;

export function useAgentChangesContext(): AgentChange[] {
  const { agentChanges } = useContext(AgentChangesContext);
  return agentChanges;
}
