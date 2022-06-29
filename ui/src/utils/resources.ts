import { Configuration, ConfigurationSpec } from "../graphql/generated";
import { APIVersion, ResourceKind } from "../types/resources";

export function newConfiguration({
  name,
  description,
  spec,
  labels,
}: {
  name: string;
  description: string;
  spec: ConfigurationSpec;
  labels?: { [key: string]: string };
}): Configuration {
  return {
    apiVersion: APIVersion.V1_BETA,
    kind: ResourceKind.CONFIGURATION,
    metadata: { name, description, labels, id: "" },
    spec,
  };
}
