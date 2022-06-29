import { GetConfigNamesQuery } from "../../graphql/generated";
import { RawConfigFormErrors, RawConfigFormValues } from "../../types/forms";
import { validateNameField } from './validate-name-field';

export function validateFields(
  formValues: RawConfigFormValues,
  configurations?: GetConfigNamesQuery["configurations"]["configurations"]
): RawConfigFormErrors {
  const { name, platform } = formValues;
  const errors: RawConfigFormErrors = {
    name: null,
    platform: null,
    description: null,
    fileName: null,
    rawConfig: null,
  };

  // Validate the Name field
  errors.name = validateNameField(
    name,
    "configuration",
    configurations?.map((c) => c.metadata.name)
  );

  // Validate the platform field
  if (platform === "") {
    errors.platform = "Required.";
  }

  return errors;
}
