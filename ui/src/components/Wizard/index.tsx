import { Box, IconButton, Paper } from "@mui/material";
import { Timeline } from "./Timeline";
import { useWizard, WizardContextProvider } from "./WizardContext";
import { XIcon } from "../Icons";
import { isFunction } from "lodash";

import styles from "./wizard.module.scss";
export interface WizardProps<FormValueType> {
  steps: Step[];
  stepComponents: JSX.Element[];
  initialFormValues: FormValueType;
  // If present a close button will be in the top right of the wizard
  // that calls this callback onClick.
  onClose?: () => void;
}

export interface Step {
  label: string;
  description: string;
}

export const Wizard = <T extends object>({
  initialFormValues,
  ...rest
}: WizardProps<T>) => {
  return (
    <WizardContextProvider initialFormValues={initialFormValues}>
      <WizardComponent {...rest} />
    </WizardContextProvider>
  );
};

export const WizardComponent = <T extends object>({
  steps,
  stepComponents,
  onClose,
}: Omit<WizardProps<T>, "initialFormValues">) => {
  const { step } = useWizard();
  return (
    <Paper classes={{ root: styles.container }}>
      <Box
        className={styles.left}
        // For this to work in storybook we have to set the background image as an inline style
        style={{ backgroundImage: "url('/background-monochrome-light.svg')" }}
      >
        <Timeline steps={steps} currentStep={step} />
      </Box>

      <Box className={styles.right}>
        {isFunction(onClose) && (
          <div className={styles.buttons}>
            <IconButton onClick={onClose}>
              <XIcon />
            </IconButton>
          </div>
        )}

        {stepComponents[step]}
      </Box>
    </Paper>
  );
};
