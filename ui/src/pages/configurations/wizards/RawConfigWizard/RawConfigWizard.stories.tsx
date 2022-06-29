import { ComponentStory, ComponentMeta } from "@storybook/react";
import { RawConfigWizard } from ".";

export default {
  title: "Raw Config Wizard",
  component: RawConfigWizard,
} as ComponentMeta<typeof RawConfigWizard>;

const Template: ComponentStory<typeof RawConfigWizard> = (args) => (
  <RawConfigWizard {...args} />
);

export const StepOne = Template.bind({});

StepOne.args = {};
