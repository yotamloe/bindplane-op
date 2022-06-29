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
import { gql } from "@apollo/client";
import { useGetConfigNamesQuery } from "../../../../graphql/generated";

import mixins from "../../../../styles/mixins.module.scss";
import styles from "./RawConfigWizard.module.scss";

gql`
  query getConfigNames {
    configurations {
      configurations {
        metadata {
          name
        }
      }
    }
  }
`;

interface StepOneProps {
  fromImport: boolean;
}

export const StepOne: React.FC<StepOneProps> = ({ fromImport }) => {
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

  function handleNextClick() {
    const errors = validateFields(formValues, data?.configurations.configurations);
    if (formInvalid(errors)) {
      setTouched({ name: true, platform: true });
      setErrors({ ...errors });
      return;
    }

    goToStep(1);
  }

  function handleSelectChange(v: string) {
    const newValues = { ...formValues, platform: v };
    setValues(newValues);
    setTouched({ platform: true });

    const errors = validateFields(newValues, data?.configurations.configurations);
    setErrors(errors);
  }

  function renderImportCopy() {
    return (
      <>
        <Typography variant="h6" classes={{ root: mixins["mb-5"] }}>
          Let's get started importing your configuration to Bindplane
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          We&apos;ve provided some basic details for this configuration, just
          verify everything looks correct.
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          When you&apos;re ready click Next to double check the configuration
          Yaml.
        </Typography>
      </>
    );
  }

  function renderStandardCopy() {
    return (
      <>
        <Typography variant="h6" classes={{ root: mixins["mb-5"] }}>
          Let's get started adding your configuration to Bindplane
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          An OpenTelemetry configuration is a YAML file that&apos;s used to
          configure your OpenTelemetry collectors. It&apos;s made up of
          receivers, processors, and exporters that are organized into one or
          more data pipelines.
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          If you&apos;re not familiar with the structure of these configs,
          please take a look at our{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/observIQ/observiq-otel-collector/tree/main/config/google_cloud_exporter"
          >
            sample files
          </a>{" "}
          and the{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://opentelemetry.io/docs/collector/configuration/"
          >
            OpenTelemetry documentation
          </a>
          .
        </Typography>

        <Typography variant="body2" classes={{ root: mixins["mb-3"] }}>
          {" "}
          Let&apos;s get started importing your config.
        </Typography>
      </>
    );
  }

  return (
    <>
      <div className={styles.container} data-testid="step-one">
        {fromImport ? renderImportCopy() : renderStandardCopy()}

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
          data-testid="step-one-next"
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
