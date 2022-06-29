import { ComponentStory, ComponentMeta } from "@storybook/react";
import { PlatformSelect } from ".";

export default {
  title: "Platform Select",
  component: PlatformSelect,
} as ComponentMeta<typeof PlatformSelect>;

const Template: ComponentStory<typeof PlatformSelect> = (args) => (
  <PlatformSelect {...args} />
);

export const Default = Template.bind({});

Default.args = {
  onPlatformSelected: (v: string) => console.log(v),
};
