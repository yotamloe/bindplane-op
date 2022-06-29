import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Step, WizardComponent } from ".";
import { useWizard, WizardContextProvider } from "./WizardContext";
import { Button, Typography } from "@mui/material";

export default {
  title: "Wizard",
  component: WizardComponent,
  decorators: [
    (Story, context) => (
      <WizardContextProvider initialFormValues={{}}>
        <Story {...context} />
      </WizardContextProvider>
    ),
  ],
} as ComponentMeta<typeof WizardComponent>;

const Template: ComponentStory<typeof WizardComponent> = (args) => (
  <WizardComponent {...args} />
);

export const Default = Template.bind({});

const defaultSteps: Step[] = [
  {
    label: "Step 1 Label",
    description: "This is the description of step 1",
  },
  {
    label: "Step 2 Label",
    description: "This is the description of step 2",
  },
  {
    label: "Step 3 Label",
    description: "This is the description of step 3",
  },
];

const Step1: React.FC = () => {
  const { goToStep } = useWizard();
  return (
    <>
      <Typography variant="body1">Step 1</Typography>
      <Button onClick={() => goToStep(0)}>Step 1</Button>
      <Button onClick={() => goToStep(1)}>Step 2</Button>
      <Button onClick={() => goToStep(2)}>Step 3</Button>
    </>
  );
};
const Step2: React.FC = () => {
  const { goToStep } = useWizard();
  return (
    <>
      <Typography variant="body1">Step 2</Typography>
      <Button onClick={() => goToStep(0)}>Step 1</Button>
      <Button onClick={() => goToStep(1)}>Step 2</Button>
      <Button onClick={() => goToStep(2)}>Step 3</Button>
    </>
  );
};
const Step3: React.FC = () => {
  const { goToStep } = useWizard();
  return (
    <>
      <Typography variant="body1">Step 3</Typography>
      <Button onClick={() => goToStep(0)}>Step 1</Button>
      <Button onClick={() => goToStep(1)}>Step 2</Button>
      <Button onClick={() => goToStep(2)}>Step 3</Button>
    </>
  );
};

const defaultStepComponents: JSX.Element[] = [<Step1 />, <Step2 />, <Step3 />];

Default.args = {
  steps: defaultSteps,
  stepComponents: defaultStepComponents,
};
