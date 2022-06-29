import React, { useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, Button, Chip, Typography } from "@mui/material";
import { UploadCloudIcon } from "../../../../components/Icons";
import { useWizard } from "../../../../components/Wizard/WizardContext";
import { YamlEditor } from "../../../../components/YamlEditor";
import { isEmpty } from "lodash";
import {
  applyResources,
  getResourceStatusFromUpdates,
} from "../../../../utils/rest/apply-resources";
import { newConfiguration } from "../../../../utils/resources";
import { RawConfigFormValues } from "../../../../types/forms";
import { DEFAULT_RAW_CONFIG } from ".";
import { UpdateStatus } from "../../../../types/resources";
import { useSnackbar } from "notistack";
import { renderInvalidReason } from "../../../../utils/forms/renderInvalidReason";

import styles from "./RawConfigWizard.module.scss";
import mixins from "../../../../styles/mixins.module.scss";

const FileInput = styled("input")({
  display: "none",
});

interface StepTwoProps {
  fromImport: boolean;
  onSuccess: (values: RawConfigFormValues) => void;
}

export const StepTwo: React.FC<StepTwoProps> = ({ fromImport, onSuccess }) => {
  const { formValues, setValues, goToStep } = useWizard<RawConfigFormValues>();
  const [invalidConfigError, setInvalidConfigError] =
    useState<null | string>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  function clearFile() {
    setValues({
      ...formValues,
      rawConfig: DEFAULT_RAW_CONFIG,
      fileName: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    const files = e?.target?.files;
    const reader = new FileReader();
    const fileName = files != null ? files[0].name : "";

    reader.onload = async (e) => {
      const text = e?.target?.result as string;
      setValues({ ...formValues, rawConfig: text, fileName: fileName });
    };

    if (files != null) {
      reader.readAsText(files[0]);
    }
  }

  async function handleSave() {
    const { name, description, platform, rawConfig } = formValues;

    const labels = { platform };
    const matchLabels = { configuration: name };
    const selector = { matchLabels };

    // Create the configuration with apply
    try {
      const { updates } = await applyResources([
        newConfiguration({
          name: name,
          description: description,
          labels: labels,
          spec: {
            raw: rawConfig,
            selector: selector,
          },
        }),
      ]);

      // verify that the updates includes created for this configuration
      const resourceStatus = getResourceStatusFromUpdates(updates, name);
      if (resourceStatus == null) {
        throw new Error(
          `No configuration with name ${name} returned in response.`
        );
      }

      switch (resourceStatus.status) {
        case UpdateStatus.CREATED:
          onSuccess(formValues);
          return;

        case UpdateStatus.INVALID:
          setInvalidConfigError(
            resourceStatus.reason ?? "Invalid configuration yaml."
          );
          return;

        default:
          throw new Error(
            `Got unexpected update status response: ${resourceStatus?.status}.`
          );
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to create configuration.", { variant: "error" });
    }
  }

  function renderImportCopy() {
    return (
      <>
        <Typography variant="h6" className={mixins["mb-5"]}>
          Import your raw OpenTelemetry configuration
        </Typography>
        <Typography variant="body1" className={mixins["mb-5"]}>
          This is the configuration of the connected agent. If everything looks
          good, click Save to complete your import.
        </Typography>
      </>
    );
  }

  function renderStandardCopy() {
    return (
      <>
        <Typography variant="h6" className={mixins["mb-5"]}>
          Import your raw OpenTelemetry configuration
        </Typography>
        <Typography variant="body1" className={mixins["mb-5"]}>
          Please upload a configuration YAML file, or copy and paste the
          contents of one into the editor below:
        </Typography>
      </>
    );
  }

  return (
    <>
      <Box className={styles.container} data-testid="step-two">
        {fromImport ? renderImportCopy() : renderStandardCopy()}

        {/* Dont allow upload when importing config from agent */}
        {!fromImport && (
          <Box className={styles["upload-box"]}>
            <label htmlFor="contained-button-file">
              <FileInput
                ref={fileInputRef}
                accept=".yaml"
                id="contained-button-file"
                data-testid="file-input"
                multiple
                type="file"
                onChange={handleUpload}
              />

              <Button
                size="small"
                classes={{ root: styles.upload }}
                variant="contained"
                component="span"
                startIcon={<UploadCloudIcon />}
              >
                Upload
              </Button>
            </label>

            {!isEmpty(formValues.fileName) && (
              <Chip
                size="small"
                label={formValues.fileName ?? null}
                onDelete={clearFile}
                classes={{ root: styles.file }}
              />
            )}
          </Box>
        )}

        <YamlEditor
          readOnly={!isEmpty(formValues.fileName)}
          value={formValues.rawConfig}
          onValueChange={(e) => setValues({ rawConfig: e.target.value })}
        />

        {invalidConfigError && renderInvalidReason(invalidConfigError)}
      </Box>
      <Box className={styles.buttons}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => goToStep(0)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          data-testid="save-button"
        >
          Save
        </Button>
      </Box>
    </>
  );
};
