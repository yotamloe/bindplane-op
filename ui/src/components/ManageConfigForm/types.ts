import { GetAgentAndConfigurationsQuery } from "../../graphql/generated";

export type Configs =
  GetAgentAndConfigurationsQuery["configurations"]["configurations"];

export type Config = NonNullable<
  GetAgentAndConfigurationsQuery["configurations"]["configurations"][0]
>;

export type Agent = NonNullable<GetAgentAndConfigurationsQuery["agent"]>;
