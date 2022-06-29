import React from "react";
import { Step, Wizard } from "../../../../components/Wizard";
import { RawConfigFormValues } from "../../../../types/forms";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";

export const DEFAULT_RAW_CONFIG = `receivers:
  hostmetrics:
    collection_interval: 1m
    scrapers:
      load:
      filesystem:
      memory:
      network:

processors:
  batch:

exporters:
  logging:
    loglevel: debug

service:
  pipelines:
    metrics:
      receivers: [hostmetrics]
      processors: [batch]
      exporters: [logging]
`;

const NEW_FORM_VALUES: RawConfigFormValues = {
  name: "",
  description: "",
  platform: "",
  rawConfig: DEFAULT_RAW_CONFIG,
  fileName: "",
};

interface RawConfigWizardProps {
  // Initial form values
  initialValues?: RawConfigFormValues;
  // Determines whether to display copy for import flow or new configuration.
  fromImport?: boolean;

  onClose?: () => void;

  // Called after the configuration is successfully saved
  onSuccess: (values: RawConfigFormValues) => void;
}

export const RawConfigWizard: React.FC<RawConfigWizardProps> = ({
  initialValues,
  fromImport = false,
  onClose,
  onSuccess,
}) => {
  const steps: Step[] = [
    {
      label: "Details",
      description:
        "Specify some basic settings for the platform you'll be shipping logs from.",
    },
    {
      label: "Import Config",
      description:
        "Import a raw OpenTelemetry configuration for use within BindPlane.",
    },
  ];

  const stepComponents = [
    <StepOne fromImport={fromImport} />,
    <StepTwo fromImport={fromImport} onSuccess={onSuccess} />,
  ];

  return (
    <Wizard
      steps={steps}
      stepComponents={stepComponents}
      initialFormValues={initialValues ?? NEW_FORM_VALUES}
      onClose={onClose}
    />
  );
};
