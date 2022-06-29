import { ShowPageConfig } from ".";
import {
  Configuration,
  Destination,
  DestinationsAndTypesQuery,
} from "../../../graphql/generated";
import { cloneDeep } from "lodash";
import { APIVersion, ResourceKind } from "../../../types/resources";
import { exclusiveQueryFromLabels } from "../../../utils/exclusive-query";

/**
 * cloneIntoConfig takes the ShowPageConfig type and returns
 * a full Configuration, adding values for apiVersion and kind
 */
export function cloneIntoConfig(
  showPageConfig: NonNullable<ShowPageConfig>
): Configuration {
  const newConfig = cloneDeep(showPageConfig) as Configuration;
  newConfig.apiVersion = APIVersion.V1_BETA;
  newConfig.kind = ResourceKind.CONFIGURATION;
  return newConfig;
}

export function cloneIntoDestination(
  destination: DestinationsAndTypesQuery["destinations"][0]
): Destination {
  const newDest = cloneDeep(destination) as Destination;
  newDest.apiVersion = APIVersion.V1_BETA;
  newDest.kind = "Destination";

  return newDest;
}

/**
 *
 * @param matchLabels the matchLabels of the configuration
 * @param platform platform label of the configuration
 */
export function initQuery(
  matchLabels: Record<string, string>,
  platform: string | undefined
): string {
  const terms: string[] = [];

  // The label that will specify all agents that don't have the current labels
  terms.push(exclusiveQueryFromLabels(matchLabels));

  // The platform label may not be set for manually created configs
  if (platform != null) {
    const matchPlatformQuery = `platform:${
      platform === "macos" ? "darwin" : platform
    }`;
    terms.push(matchPlatformQuery);
  }

  return terms.join(" ");
}
