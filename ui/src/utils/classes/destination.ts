import { cloneDeep } from "lodash";
import {
  Destination,
  Metadata,
  ParameterizedSpec,
} from "../../graphql/generated";
import { APIVersion, ResourceStatus } from "../../types/resources";
import { applyResources } from "../rest/apply-resources";

type MinimumDestination = Pick<Destination, "spec" | "metadata">;

export class BPDestination implements Destination {
  __typename?: "Destination" | undefined;
  apiVersion: string;
  kind: string;
  metadata: Metadata;
  spec: ParameterizedSpec;

  constructor(d: MinimumDestination) {
    this.apiVersion = APIVersion.V1_BETA;
    this.kind = "Destination";
    this.metadata = d.metadata;
    this.spec = d.spec;
  }

  name(): string {
    return this.metadata.name;
  }

  // setParamsFromMap sets the spec.parameters from Record<string, any>.
  // If the "name" key is specified it will ignore it.
  setParamsFromMap(values: Record<string, any>) {
    const params: ParameterizedSpec["parameters"] = [];
    for (const [k, v] of Object.entries(values)) {
      if (k !== "name") {
        params.push({
          name: k,
          value: v,
        });
      }
    }

    const newSpec = cloneDeep(this.spec);
    newSpec.parameters = params;
    this.spec = newSpec;
  }

  async apply(): Promise<ResourceStatus> {
    const { updates } = await applyResources([this]);
    const update = updates.find(
      (u) => u.resource.metadata.name === this.name()
    );
    if (update == null) {
      throw new Error(
        `failed to apply configuration, no update with name ${this.name()}`
      );
    }
    return update;
  }
}
