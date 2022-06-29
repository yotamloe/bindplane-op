import { ComponentProps } from "react";
import { Chip } from "@mui/material";
import { AgentStatus } from "../../types/agents";
import { format } from "date-fns";
import { timeAgoInWords } from "../../utils/time";

import mixins from "../../styles/mixins.module.scss";

export function renderAgentLabels(
  labels: Record<string, string> | undefined
): JSX.Element {
  if (labels == null) return <></>;
  return (
    <>
      {Object.entries(labels).map(([k, v]) => {
        if (k.startsWith("bindplane/agent")) return null;

        const formattedLabel = `${k}: ${v}`;
        return (
          <Chip
            key={k}
            size="small"
            label={formattedLabel}
            classes={{ root: mixins["m-1"] }}
          />
        );
      })}
    </>
  );
}

export function renderAgentStatus(
  status: AgentStatus | undefined
): JSX.Element {
  let statusText: string;
  let color: ComponentProps<typeof Chip>["color"] = "default";

  switch (status) {
    case AgentStatus.DISCONNECTED:
      statusText = "Disconnected";
      break;
    case AgentStatus.CONNECTED:
      statusText = "Connected";
      color = "success";
      break;
    case AgentStatus.ERROR:
      statusText = "Errored";
      color = "error";
      break;
    // Component failed is deprecated.
    case AgentStatus.COMPONENT_FAILED:
      statusText = "Component Failed";
      break;
    case AgentStatus.DELETED:
      statusText = "Deleted";
      break;
    case AgentStatus.CONFIGURING:
      statusText = "Configuring";
      break;
    default:
      statusText = "";
      break;
  }

  return <Chip size="small" color={color} label={statusText} />;
}

export function renderAgentDate(date: string | undefined): JSX.Element {
  if (date == null) {
    return <>-</>;
  }

  return <>{format(new Date(date), "MMM dd yyyy HH:mm")}</>;
}

export function renderAgentReported(date: string | undefined): JSX.Element {
  if (date == null) {
    return <>-</>;
  }

  return <>{timeAgoInWords(new Date(date))}</>;
}

export function getCustomLabels(labels: Record<string, string>) {
  const customLabels: Record<string, string> = {};
  for (const [k, v] of Object.entries(labels)) {
    if (!k.startsWith("bindplane/")) {
      customLabels[k] = v;
    }
  }

  return customLabels;
}
