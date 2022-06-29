import { Button, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { ChangeEvent } from "react";
import { PlatformSelect } from "../../../../components/PlatformSelect";
import { useWizard } from "../../../../components/Wizard/WizardContext";
import {
  RawConfigFormErrors,
  RawConfigFormValues,
} from "../../../../types/forms";
import { validateFields } from "../../../../utils/forms/validate-config-fields";
import { Link } from "react-router-dom";
import { useGetConfigNamesQuery } from "../../../../graphql/generated";

import mixins from "../../../../styles/mixins.module.scss";
import styles from "./assisted-config-wizard.module.scss";

export const StepOne: React.FC = (props) => {
  const {
    formValues,
    formErrors,
    formTouched,
    setValues,
    setErrors,
    setTouched,
    goToStep,
  } = useWizard<RawConfigFormValues>();

  const { data } = useGetConfigNamesQuery();

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setValues({ name: e.target.value });
    const errors = validateFields(
      {
        ...formValues,
        name: e.target.value,
      },
      data?.configurations.configurations
    );

    setErrors({ ...errors });
  }

  function handleSelectChange(v: string) {
    const newValues = { ...formValues, platform: v };
    setValues(newValues);
    setTouched({ platform: true });

    const errors = validateFields(newValues, data?.configurations.configurations);
    setErrors(errors);
  }

  function handleNextClick() {
    const errors = validateFields(formValues, data?.configurations.configurations);
    if (formInvalid(errors)) {
      setTouched({ name: true, platform: true });
      setErrors({ ...errors });
      return;
    }

    goToStep(1);
  }

  return (
    <>
      <div className={styles.container} data-testid="step-one">
        <Typography variant="h6" classes={{ root: mixins["mb-5"] }}>
          Let's get started building your configuration
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          The BindPlane configuration builder makes it easy to assemble a valid
          OpenTelemetry config.
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          Already have a configuration? Use our{" "}
          <Link to="/configurations/new-raw">raw configuration wizard</Link>.
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          We&apos;ll walk you through configuring the data providers you want to
          ingest logs / metrics from and the destination you want to send the
          data to.
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          At the end, you’ll have a valid YAML file you can download directly or
          you can use BindPlane to quickly apply the config to one or more of
          your agents.
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          {" "}
          Let&apos;s get started importing your config.
        </Typography>

        <Typography
          fontWeight={600}
          variant="subtitle1"
          classes={{ root: mixins["mb-2"] }}
        >
          Configuration Details
        </Typography>

        <Box component="form" className={styles.form}>
          <TextField
            autoComplete="off"
            fullWidth
            size="small"
            label="Name"
            name="name"
            id="name"
            error={formErrors.name != null && formTouched.name}
            helperText={formTouched.name ? formErrors.name : null}
            onChange={handleNameChange}
            onBlur={() => setTouched({ name: true })}
            value={formValues.name}
          />

          <PlatformSelect
            size="small"
            name="platform"
            id="platform"
            label="Platform"
            onPlatformSelected={handleSelectChange}
            value={formValues.platform}
            inputProps={{
              "data-testid": "platform-select-input",
            }}
            error={formErrors.platform != null && formTouched.platform}
            helperText={formTouched.platform ? formErrors.platform : null}
            onBlur={() => {
              setTouched({ ...formTouched, platform: true });
            }}
          ></PlatformSelect>

          <TextField
            autoComplete="off"
            fullWidth
            size="small"
            minRows={3}
            multiline
            name="description"
            label="Description"
            value={formValues.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setValues({ description: e.target.value })
            }
            onBlur={() => setTouched({ description: true })}
          />
        </Box>
      </div>
      <Box className={styles.buttons}>
        <div />
        <Button
          variant="contained"
          disabled={
            formTouched.name && formTouched.platform && formInvalid(formErrors)
          }
          onClick={handleNextClick}
        >
          Next
        </Button>
      </Box>
    </>
  );
};

function formInvalid(errors: RawConfigFormErrors): boolean {
  for (const val of Object.values(errors)) {
    if (val != null) {
      return true;
    }
  }

  return false;
}
