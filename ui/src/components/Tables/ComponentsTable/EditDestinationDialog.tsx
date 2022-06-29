import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useGetDestinationWithTypeQuery } from "../../../graphql/generated";
import { BPDestination } from "../../../utils/classes";
import { EditResourceDialog } from "../../EditResourceDialog";

interface EditDestinationProps {
  name: string;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export const EditDestinationDialog: React.FC<EditDestinationProps> = ({
  name,
  onSaveSuccess,
  onCancel,
}) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { data, error } = useGetDestinationWithTypeQuery({
    variables: {
      name,
    },
    fetchPolicy: "network-only",
  });

  // Communicate error if present.
  useEffect(() => {
    if (error != null) {
      enqueueSnackbar(`Error retrieving data for destination ${name}.`, {
        variant: "error",
      });
      console.error(error);
    }
  }, [enqueueSnackbar, error, name]);

  // Open dialog when we have data.
  useEffect(() => {
    if (data != null) {
      setOpen(true);
    }
  }, [data, setOpen]);

  async function handleSave(values: { [key: string]: any }) {
    const destination = new BPDestination(
      data?.destinationWithType.destination!
    );
    destination.setParamsFromMap(values);

    try {
      await destination.apply();
      enqueueSnackbar("Saved destination!", { variant: "success" });
      setOpen(false);
      onSaveSuccess();
    } catch (err) {
      enqueueSnackbar("Error saving destination", { variant: "error" });
      console.error(err);
    }
  }

  function handleCancel() {
    setOpen(false);
    onCancel();
  }

  return (
    <EditResourceDialog
      onSave={handleSave}
      onCancel={handleCancel}
      parameters={data?.destinationWithType.destination?.spec.parameters ?? []}
      parameterDefinitions={
        data?.destinationWithType.destinationType?.spec.parameters ?? []
      }
      title={name}
      description={""}
      kind={"destination"}
      open={open}
    />
  );
};
