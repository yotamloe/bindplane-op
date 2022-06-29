import { Dialog, DialogContent, DialogProps } from "@mui/material";
import { Parameter, ParameterDefinition } from "../../graphql/generated";
import { ResourceConfigForm } from "../ResourceTypeForm";

interface EditResourceBaseProps extends DialogProps {
  onSave: (values: { [key: string]: any }) => void;
  onDelete?: () => void;
  onCancel: () => void;
  parameters: Parameter[];
  parameterDefinitions: ParameterDefinition[];
  title: string;
  description: string;
  includeNameField?: boolean;
  kind: "source" | "destination";
}

export const EditResourceDialog: React.FC<EditResourceBaseProps> = ({
  onSave,
  onDelete,
  onCancel,
  parameters,
  title,
  parameterDefinitions,
  description,
  kind,
  includeNameField = false,
  ...dialogProps
}) => {
  return (
    <Dialog {...dialogProps} onClose={onCancel}>
      <DialogContent>
        <ResourceConfigForm
          includeNameField={includeNameField}
          title={title}
          description={description}
          kind={kind}
          parameterDefinitions={parameterDefinitions}
          parameters={parameters}
          onSave={onSave}
          onDelete={onDelete}
          onBack={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
