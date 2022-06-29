import { AgentSelector } from '../graphql/generated';

export function selectorString(sel: AgentSelector | undefined | null): string {
  if (sel == null) {
    return "";
  }
  return Object.entries(sel.matchLabels)
    .map(([k, v]) => `${k}=${v}`)
    .join(",");
}
