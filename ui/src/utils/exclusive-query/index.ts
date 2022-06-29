import { trim } from "lodash";

/**
 * exclusiveQueryFromLabels takes in configuration match labels and returns the query to
 * get all agents that are not using those labels.
 */
export function exclusiveQueryFromLabels(matchLabels: {
  [key: string]: string;
}): string {
  let query = "";

  const entries = Object.entries(matchLabels);

  for (const [label, value] of entries) {
    query = query + `-${label}:${value} `;
  }
  return trim(query);
}
