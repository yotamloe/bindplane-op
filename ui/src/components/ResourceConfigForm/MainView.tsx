import { Grid, Button, Typography, Divider } from "@mui/material";
import { Maybe } from "graphql/jsutils/Maybe";
import { isFunction } from "lodash";
import {
  ParameterDefinition,
  ResourceConfiguration,
} from "../../graphql/generated";
import { classes } from "../../utils/styles";
import { PlusCircleIcon } from "../Icons";
import {
  ButtonFooter,
  FormTitle,
  InlineProcessorLabel,
  ParameterInput,
  ResourceNameInput,
  satisfiesRelevantIf,
  useValidationContext,
  isValid,
} from ".";

import mixins from "../../styles/mixins.module.scss";

interface MainProps {
  title: string;
  description: string;
  kind: "source" | "destination" | "processor";
  formValues: { [key: string]: any };
  setFormValues: React.Dispatch<
    React.SetStateAction<{
      [key: string]: any;
    }>
  >;
  includeNameField?: boolean;
  existingResourceNames?: string[];
  parameterDefinitions: ParameterDefinition[];
  processors: Maybe<ResourceConfiguration[]>;
  enableProcessors?: boolean;
  onBack?: () => void;
  onSave?: (formValues: { [key: string]: any }) => void;
  onDelete?: () => void;
  onAddProcessor: () => void;
  onEditProcessor: (editingIndex: number) => void;
}

export const MainView: React.FC<MainProps> = ({
  title,
  description,
  kind,
  formValues,
  includeNameField,
  setFormValues,
  existingResourceNames,
  parameterDefinitions,
  processors,
  enableProcessors,
  onBack,
  onSave,
  onDelete,
  onAddProcessor,
  onEditProcessor,
}) => {
  const { errors } = useValidationContext();

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    isFunction(onSave) && onSave(formValues);
  }

  const primaryButton: JSX.Element = (
    <Button
      disabled={!isValid(errors)}
      type="submit"
      variant="contained"
      data-testid="resource-form-save"
    >
      Save
    </Button>
  );

  const backButton: JSX.Element = (
    <Button variant="contained" color="secondary" onClick={onBack}>
      Back
    </Button>
  );

  const deleteButton: JSX.Element | undefined = isFunction(onDelete) ? (
    <Button
      variant="outlined"
      color="error"
      onClick={onDelete}
      classes={{ root: mixins["mr-2"] }}
    >
      Delete
    </Button>
  ) : undefined;

  return (
    <>
      <FormTitle title={title} description={description} />

      <form onSubmit={handleSubmit} data-testid="resource-form">
        {/** Source Configuration Section */}
        <Typography fontWeight={600} marginBottom={2}>
          Configure
        </Typography>
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

        {/** Processors Section */}
        {processors && (
          <>
            <Divider />
            <Typography fontWeight={600} marginTop={2}>
              Processors
            </Typography>
            {processors.map((p, ix) => {
              function onRemove() {
                // TODO
              }
              return (
                <InlineProcessorLabel
                  key={`${p.name}-${ix}`}
                  processor={p}
                  onEdit={() => onEditProcessor(ix)}
                  onRemove={onRemove}
                />
              );
            })}
          </>
        )}

        {enableProcessors && (
          <>
            <Button
              variant="text"
              startIcon={<PlusCircleIcon />}
              classes={{ root: mixins["mb-2"] }}
              onClick={onAddProcessor}
            >
              Add processor
            </Button>
            <Divider />
          </>
        )}

        <ButtonFooter
          backButton={backButton}
          secondaryButton={deleteButton ?? <></>}
          primaryButton={primaryButton}
        />
      </form>
    </>
  );
};
