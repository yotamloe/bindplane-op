import { Configuration, Destination, Source } from "../graphql/generated";

// TODO (dsvanlani) this should include all resource types
export type Resource = Configuration | Source | Destination;

/** ResourceStatus contains a resource and its UpdateStatus after a change */
export interface ResourceStatus {
  resource: Resource;
  status: UpdateStatus;
  reason?: string;
}

export enum APIVersion {
  V1_BETA = "bindplane.observiq.com/v1beta",
}

export enum ResourceKind {
  CONFIGURATION = "Configuration",
  DESTINATION = "Destination",
  SOURCE = "Source",
  DESTINATION_TYPE = "DestinationType",
  SOURCE_TYPE = "SourceType",
}

export enum UpdateStatus {
  CREATED = "created",
  CONFIGURED = "configured",
  UNCHANGED = "unchanged",
  DELETED = "deleted",
  INVALID = "invalid",
}
