import { Maybe } from "graphql/jsutils/Maybe";
import { useState } from "react";
import {
  CreateProcessorConfigureView,
  CreateProcessorSelectView,
  EditProcessorView,
  initFormValues,
  MainView,
  ValidationContextProvider,
} from ".";
import {
  ParameterDefinition,
  Parameter,
  ResourceConfiguration,
  GetProcessorTypesQuery,
} from "../../graphql/generated";

enum Page {
  MAIN,
  CREATE_PROCESSOR_SELECT,
  CREATE_PROCESSOR_CONFIGURE,
  EDIT_PROCESSOR,
}

export type ProcessorType = GetProcessorTypesQuery["processorTypes"][0];

export interface FormValues {
  // The name of the Source or Destination
  name?: string;
  // The values for the Parameters
  [key: string]: any;
  // The inline processors configured for the Source or Destination
  processors?: ResourceConfiguration[];
}

interface ResourceFormProps {
  // Display name for the resource
  title: string;

  description: string;

  // Used to determine some form values.
  kind: "destination" | "source" | "processor";

  parameterDefinitions: ParameterDefinition[];

  // If present the form will use these values as defaults
  parameters?: Maybe<Parameter[]>;

  // If present the form will have a name field at the top and will be sent
  // as the formValues["name"] key.
  includeNameField?: boolean;

  // Used to validate the name field if includeNameField is present.
  existingResourceNames?: string[];

  // Any inline processors for the resource, only applies to Sources
  processors?: Maybe<ResourceConfiguration[]>;

  // If true will allow the form to add inline processors to the resource.
  enableProcessors?: boolean;

  // If present the form will display a "delete" button which calls
  // the onDelete callback.
  onDelete?: () => void;

  // The callback when the resource is saved.
  onSave?: (formValues: { [key: string]: any }) => void;

  // The callback when cancel is clicked.
  onBack?: () => void;

  onEditProcessorSave?: (formValues: { [key: string]: any }) => void;
  onNewProcessorSave?: (formValues: { [key: string]: any }) => void;
}

const ResourceConfigurationFormComponent: React.FC<ResourceFormProps> = ({
  title,
  description,
  parameters,
  parameterDefinitions,
  processors,
  enableProcessors,
  includeNameField,
  existingResourceNames,
  kind,
  onDelete,
  onSave,
  onBack,
  onEditProcessorSave,
  onNewProcessorSave,
}) => {
  const initValues = initFormValues(
    parameterDefinitions,
    parameters,
    processors,
    includeNameField
  );

  const [formValues, setFormValues] =
    useState<{ [key: string]: any }>(initValues);

  const [page, setPage] = useState<Page>(Page.MAIN);
  const [newProcessorType, setNewProcessorType] =
    useState<ProcessorType | null>(null);
  const [editingProcessorIndex, setEditingProcessorIndex] =
    useState<number>(-1);

  function handleAddProcessor() {
    setPage(Page.CREATE_PROCESSOR_SELECT);
  }

  function handleReturnToMain() {
    setPage(Page.MAIN);
    setNewProcessorType(null);
    setEditingProcessorIndex(-1);
  }

  function handleSelectNewProcessor(pt: ProcessorType) {
    setPage(Page.CREATE_PROCESSOR_CONFIGURE);
    setNewProcessorType(pt);
  }

  function handleEditProcessorClick(editingIndex: number) {
    setEditingProcessorIndex(editingIndex);
    setPage(Page.EDIT_PROCESSOR);
  }

  switch (page) {
    case Page.MAIN:
      return (
        <MainView
          title={title}
          description={description}
          kind={kind}
          formValues={formValues}
          includeNameField={includeNameField}
          setFormValues={setFormValues}
          existingResourceNames={existingResourceNames}
          parameterDefinitions={parameterDefinitions}
          processors={processors}
          enableProcessors={enableProcessors}
          onBack={onBack}
          onSave={onSave}
          onDelete={onDelete}
          onAddProcessor={handleAddProcessor}
          onEditProcessor={handleEditProcessorClick}
        />
      );
    case Page.CREATE_PROCESSOR_SELECT:
      return (
        <CreateProcessorSelectView
          title={title}
          onBack={handleReturnToMain}
          onSelect={handleSelectNewProcessor}
        />
      );
    case Page.CREATE_PROCESSOR_CONFIGURE:
      return (
        <CreateProcessorConfigureView
          onBack={handleReturnToMain}
          onSave={onNewProcessorSave!}
          title={title}
          processorType={newProcessorType!}
        />
      );
    case Page.EDIT_PROCESSOR:
      return (
        <EditProcessorView
          title={title}
          processors={processors!}
          editingIndex={editingProcessorIndex}
          onEditProcessorSave={onEditProcessorSave!}
          onBack={handleReturnToMain}
        />
      );
  }
};

export const ResourceConfigForm: React.FC<ResourceFormProps> = (props) => {
  return (
    <ValidationContextProvider>
      <ResourceConfigurationFormComponent {...props} />
    </ValidationContextProvider>
  );
};
