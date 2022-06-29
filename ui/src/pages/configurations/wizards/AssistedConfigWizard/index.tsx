import { Step, Wizard } from "../../../../components/Wizard";
import { ResourceConfiguration } from "../../../../graphql/generated";
import { StepOne } from "./StepOne";
import { StepThree } from "./StepThree";
import { StepTwo } from "./StepTwo";

const steps: Step[] = [
  {
    label: "Details",
    description:
      "Specify some basic settings for the platform you'll be shipping logs and/or metrics from.",
  },
  {
    label: "Add Sources",
    description: "A source is a combination of receivers and processors",
  },
  {
    label: "Add Destination",
    description: "A destination is a combination of an exporter and processors",
  },
];

const stepComponents = [<StepOne />, <StepTwo />, <StepThree />];

export interface AssistedWizardFormValues {
  name: string;
  description: string;
  platform: string;
  sources: ResourceConfiguration[];
  destination: ResourceConfigurationAction | null;
}

// Stores the resource and a boolean if we need to create
// a new resource for the ResourceConfiguration
export interface ResourceConfigurationAction {
  resourceConfiguration: ResourceConfiguration;
  create: boolean;
}

const initialFormValues: AssistedWizardFormValues = {
  name: "",
  description: "",
  platform: "",
  sources: [],
  destination: null,
};

export const AssistedConfigWizard: React.FC = () => {
  return (
    <Wizard
      steps={steps}
      stepComponents={stepComponents}
      initialFormValues={initialFormValues}
    />
  );
};
