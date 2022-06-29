import { Button } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
  title: "Button",
  component: Button,
  argTypes: {
    size: {
      options: ["small", "medium", "large"],
      control: { type: "radio" },
    },
    color: {
      options: ["primary", "secondary", "info", "error", "warning", "success"],
      control: { type: "radio" },
    },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Button</Button>
);

export const Default = Template.bind({});
export const Contained = Template.bind({});
export const Outlined = Template.bind({});

Default.args = {};
Contained.args = {
  variant: "contained",
};
Outlined.args = {
  variant: "outlined",
};
