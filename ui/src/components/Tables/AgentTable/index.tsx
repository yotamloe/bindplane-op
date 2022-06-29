import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { GetAgentAndConfigurationsQuery } from "../../../graphql/generated";
import { AgentStatus } from "../../../types/agents";
import {
  renderAgentDate,
  renderAgentLabels,
  renderAgentStatus,
} from "../utils";
import styles from "./agent-table.module.scss";

type AgentTableAgent = NonNullable<GetAgentAndConfigurationsQuery["agent"]>;
interface AgentTableProps {
  agent: AgentTableAgent;
}

export const AgentTable: React.FC<AgentTableProps> = ({ agent }) => {
  function renderTable(agent: AgentTableAgent): JSX.Element {
    const { status, labels, connectedAt, disconnectedAt } = agent;

    const labelsEl = renderAgentLabels(labels);
    const statusEl = renderAgentStatus(status);

    function renderConnectedAtRow(): JSX.Element {
      if (status === AgentStatus.CONNECTED) {
        const connectedEl = renderAgentDate(connectedAt);
        return renderRow("Connected", connectedEl);
      }

      const disconnectedEl = renderAgentDate(disconnectedAt);
      return renderRow("Disconnected", disconnectedEl);
    }

    return (
      <Table size="small" classes={{ root: styles.table }}>
        <TableBody>
          {renderRow("Status", statusEl)}
          {renderRow("Labels", labelsEl)}
          {renderConnectedAtRow()}
          {renderRow("Version", <>{agent.version}</>)}
          {renderRow("Host Name", <>{agent.hostName}</>)}
          {renderRow("Remote Address", <>{agent.remoteAddress}</>)}
          {renderRow("MAC Address", <>{agent.macAddress}</>)}
          {renderRow("Operating System", <>{agent.operatingSystem}</>)}
          {renderRow("Platform", <>{agent.platform}</>)}
          {renderRow("Architecture", <>{agent.architecture}</>)}
          {renderRow("Home", <>{agent.home}</>)}
          {renderRow("Agent ID", <>{agent.id}</>)}
        </TableBody>
      </Table>
    );
  }
  return <>{agent == null ? null : renderTable(agent)}</>;
};

function renderRow(key: string, value: JSX.Element): JSX.Element {
  return (
    <TableRow>
      <TableCell classes={{ root: styles["key-column"] }}>
        <Typography variant="overline">{key}</Typography>
      </TableCell>
      <TableCell>{value}</TableCell>
    </TableRow>
  );
}
