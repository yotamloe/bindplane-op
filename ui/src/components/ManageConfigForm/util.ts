import { Agent, Configuration } from "../../graphql/generated";
import { Configs } from "./types";

export function getCurrentConfig(
  agent: Agent,
  configurations: Partial<Configuration>[]
): Partial<Configuration> | undefined {
  const configName = agent.configurationResource?.metadata?.name;

  if (configName == null) return undefined;

  return configurations.find((c) => c.metadata?.name === configName);
}

export function filterConfigsByPlatform(
  configurations: Configs,
  // darwin, linux, windows
  platform: Agent["platform"]
): Configs {
  // Not obvious why this could be undefined - but return all configurations
  if (platform == null) {
    return configurations;
  }

  let matchPlatform: string;
  if (platform === "darwin") {
    matchPlatform = "macos";
  } else {
    matchPlatform = platform;
  }

  const filtered = configurations.reduce<Configs>((prev, cur) => {
    // If labels is undefined on configuration still include it.
    if (cur.metadata?.labels == null) {
      return prev.concat(cur);
    }
    // Include the configuration if its platform matches.
    if (cur.metadata.labels.platform === matchPlatform) {
      return prev.concat(cur);
    }
    return prev;
  }, []);

  return filtered;
}
