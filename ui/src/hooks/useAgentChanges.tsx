import { gql } from "@apollo/client";
import { useContext } from "react";
import { AgentChangesContext } from "../contexts/AgentChanges";
import { AgentChange } from "../graphql/generated";

gql`
  subscription AgentChanges($selector: String, $query: String) {
    agentChanges(selector: $selector, query: $query) {
      agent {
        id
        name
        architecture
        operatingSystem
        labels
        hostName
        platform
        version
        macAddress
        home
        type
        status
        connectedAt
        disconnectedAt
        configuration {
          Collector
        }
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
  }
`;

export function useAgentChangesContext(): AgentChange[] {
  const { agentChanges } = useContext(AgentChangesContext);
  return agentChanges;
}
