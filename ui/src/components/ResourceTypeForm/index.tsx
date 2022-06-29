import { Button, Grid, Typography, Stack } from "@mui/material";
import { ParameterInput, ResourceNameInput } from "./ParameterInput";
import React, { useState } from "react";
import { Parameter, ParameterDefinition } from "../../graphql/generated";
import { isFunction } from "lodash";
import { classes } from "../../utils/styles";
import { satisfiesRelevantIf } from "./satisfiesRelevantIf";
import { Maybe } from "graphql/jsutils/Maybe";
import {
  isValid,
  useValidationContext,
  ValidationContextProvider,
} from "./ValidationContext";

import mixins from "../../styles/mixins.module.scss";

interface ResourceFormProps {
  // Display name for the resource
  title: string;

  description: string;

  // Used to determine some form values.
  kind: "destination" | "source";

  parameterDefinitions: ParameterDefinition[];

  // If present the form will use these values as defaults
  parameters?: Maybe<Parameter[]>;

  // If present the form will have a name field at the top and will be sent
  // as the formValues["name"] key.
  includeNameField?: boolean;

  // Used to validate the name field if includeNameField is present.
  existingResourceNames?: string[];

  // If present the form will display a "delete" button which calls
  // the onDelete callback.
  onDelete?: () => void;

  // The callback when the resource is saved.
  onSave?: (formValues: { [key: string]: any }) => void;

  // The callback when cancel is clicked.
  onBack?: () => void;
}

const ResourceConfigurationFormComponent: React.FC<ResourceFormProps> = ({
  title,
  description,
  parameters,
  parameterDefinitions,
  includeNameField,
  existingResourceNames,
  kind,
  onDelete,
  onSave,
  onBack,
}) => {
  // Assign defaults
  let defaults: { name?: string; [key: string]: any } = {};
  if (includeNameField) {
    defaults.name = "";
  }

  for (const definition of parameterDefinitions) {
    defaults[definition.name] = definition.default;
  }

  // Override with existing values if present
  if (parameters != null) {
    for (const parameter of parameters) {
      defaults[parameter.name] = parameter.value;
    }
  }

  const [formValues, setFormValues] =
    useState<{ [key: string]: any }>(defaults);

  const { errors } = useValidationContext();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    isFunction(onSave) && onSave(formValues);
  }

  function renderParameter(p: ParameterDefinition) {
    const onValueChange = (v: string) => {
      setFormValues((prev) => ({ ...prev, [p.name]: v }));
    };

    if (satisfiesRelevantIf(formValues, p)) {
      return (
        <Grid key={p.name} item>
          <ParameterInput
            definition={p}
            value={formValues[p.name]}
            onValueChange={onValueChange}
          />
        </Grid>
      );
    }

    return null;
  }

  return (
    <>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" className={mixins["mb-5"]}>
        {description}
      </Typography>

      <form onSubmit={handleSubmit} data-testid="resource-form">
        <Grid
          container
          direction={"column"}
          spacing={3}
          className={classes([mixins["form-width"], mixins["mb-5"]])}
        >
          {includeNameField && (
            <Grid item>
              <ResourceNameInput
                kind={kind}
                value={formValues.name}
                onValueChange={(v: string) =>
                  setFormValues((prev) => ({ ...prev, name: v }))
                }
                existingNames={existingResourceNames}
              />
            </Grid>
          )}
          {parameterDefinitions.length === 0 ? (
            <Grid item>
              <Typography>No additional configuration needed.</Typography>
            </Grid>
          ) : (
            parameterDefinitions.map((p) => renderParameter(p))
          )}
        </Grid>

        <Stack direction={"row"} justifyContent="space-between">
          <Button variant="contained" color="secondary" onClick={onBack}>
            Back
          </Button>
          <div>
            {isFunction(onDelete) && (
              <Button
                variant="outlined"
                color="error"
                onClick={onDelete}
                classes={{ root: mixins["mr-2"] }}
              >
                Delete
              </Button>
            )}

            <Button
              disabled={!isValid(errors)}
              type="submit"
              variant="contained"
              data-testid="resource-form-save"
            >
              Save
            </Button>
          </div>
        </Stack>
      </form>
    </>
  );
};

export const ResourceConfigForm: React.FC<ResourceFormProps> = (props) => {
  return (
    <ValidationContextProvider>
      <ResourceConfigurationFormComponent {...props} />
    </ValidationContextProvider>
  );
};
