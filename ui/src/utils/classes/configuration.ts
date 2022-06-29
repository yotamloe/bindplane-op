import { cloneDeep } from "lodash";
import {
  Configuration,
  ConfigurationSpec,
  Metadata,
  ResourceConfiguration,
} from "../../graphql/generated";
import {
  APIVersion,
  ResourceKind,
  ResourceStatus,
} from "../../types/resources";
import { applyResources } from "../rest/apply-resources";

export class BPConfiguration implements Configuration {
  apiVersion: string;
  kind: string;
  spec: ConfigurationSpec;
  metadata: Metadata;
  constructor(configuration: Partial<Configuration>) {
    this.apiVersion = APIVersion.V1_BETA;
    this.kind = ResourceKind.CONFIGURATION;
    this.spec = configuration.spec ?? {
      raw: "",
      sources: [],
      destinations: [],
    };
    this.metadata = configuration.metadata ?? {
      name: "",
      id: "",
    };
  }

  name(): string {
    return this.metadata.name;
  }

  isRaw(): boolean {
    return this.spec.raw != null && this.spec.raw.length > 0;
  }

  isModular(): boolean {
    return !this.isRaw();
  }

  addSource(rc: ResourceConfiguration) {
    const newSources = this.spec.sources ? [...this.spec.sources] : [];
    newSources.push(rc);

    const newSpec = cloneDeep(this.spec);
    newSpec.sources = newSources;

    this.spec = newSpec;
  }

  replaceSource(rc: ResourceConfiguration, ix: number) {
    const newSources = this.spec.sources ? [...this.spec.sources] : [];
    newSources[ix] = rc;

    const newSpec = cloneDeep(this.spec);
    newSpec.sources = newSources;

    this.spec = newSpec;
  }

  removeSource(ix: number) {
    const newSources = this.spec.sources ? [...this.spec.sources] : [];
    newSources.splice(ix, 1);

    const newSpec = cloneDeep(this.spec);
    newSpec.sources = newSources;

    this.spec = newSpec;
  }

  addDestination(rc: ResourceConfiguration) {
    const newDestinations = this.spec.destinations
      ? [...this.spec.destinations]
      : [];
    newDestinations.push(rc);

    const newSpec = cloneDeep(this.spec);
    newSpec.destinations = newDestinations;

    this.spec = newSpec;
  }

  replaceDestination(rc: ResourceConfiguration, ix: number) {
    const newDestinations = this.spec.destinations
      ? [...this.spec.destinations]
      : [];
    newDestinations[ix] = rc;

    const newSpec = cloneDeep(this.spec);
    newSpec.destinations = newDestinations;

    this.spec = newSpec;
  }

  removeDestination(ix: number) {
    const newDestinations = this.spec.destinations
      ? [...this.spec.destinations]
      : [];
    newDestinations.splice(ix, 1);

    const newSpec = cloneDeep(this.spec);
    newSpec.destinations = newDestinations;
    this.spec = newSpec;
  }

  // Adds key value pairs to the selector match label field.
  // Will override any existing labels with that key.
  addMatchLabels(labels: Record<string, string>) {
    this.spec.selector = {
      matchLabels: {
        ...this.spec.selector?.matchLabels,
        ...labels,
      },
    };
  }

  async apply(): Promise<ResourceStatus> {
    const { updates } = await applyResources([this]);
    const update = updates.find(
      (u) => u.resource.metadata.name === this.name()
    );

    if (update == null) {
      throw new Error(
        `failed to apply updated configuration, no update with name ${this.name()} returned.`
      );
    }

    return update;
  }
}
