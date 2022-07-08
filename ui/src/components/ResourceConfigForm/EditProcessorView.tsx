import { FormValues, ResourceConfigForm } from ".";
import {
  ResourceConfiguration,
  useGetProcessorTypeQuery,
} from "../../graphql/generated";
import { FormTitle } from "./FormTitle";

interface EditProcessorViewProps {
  title: string;
  processors: ResourceConfiguration[];
  editingIndex: number;
  onEditProcessorSave: (values: FormValues) => void;
  onBack: () => void;
}

export const EditProcessorView: React.FC<EditProcessorViewProps> = ({
  title,
  processors,
  editingIndex,
  onEditProcessorSave,
  onBack,
}) => {
  // Get the processor type
  const type = processors[editingIndex].type;
  // TODO (dsvanlani) handle loading and error states
  const { data, loading, error } = useGetProcessorTypeQuery({
    variables: { type: type ?? "" },
  });

  return (
    <>
      <FormTitle
        title={title}
        crumbs={[`Editing ${data?.processorType?.metadata.displayName}`]}
      />
      <ResourceConfigForm
        title={""}
        description={data?.processorType?.metadata.description ?? ""}
        kind={"processor"}
        parameterDefinitions={data?.processorType?.spec.parameters ?? []}
        parameters={processors[editingIndex].parameters}
        onSave={onEditProcessorSave}
        onBack={onBack}
      />
    </>
  );
};
