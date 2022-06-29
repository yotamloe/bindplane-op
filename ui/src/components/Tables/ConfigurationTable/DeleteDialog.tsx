import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { GridSelectionModel } from "@mui/x-data-grid";
import React from "react";
import { ResourceKind } from "../../../types/resources";
import { deleteResources } from "../../../utils/rest/delete-resources";

interface DeleteModalProps {
  open: boolean;
  selected: GridSelectionModel;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

export const DeleteDialog: React.FC<DeleteModalProps> = ({
  open,
  selected,
  onClose,
  onDeleteSuccess,
}) => {
  async function onDelete() {
    const resources = selected.map((name) => ({
      kind: ResourceKind.CONFIGURATION,
      metadata: {
        // GridRowId can be string | number, in this case string
        name: name as string,
      },
    }));

    try {
      await deleteResources(resources);
      onDeleteSuccess && onDeleteSuccess();
      onClose();
    } catch (err) {
      // TODO (dsvanlani) Make an error toast.
      console.error(err);
    }
  }
  return (
    <Dialog open={open} onClose={onClose} data-testid="delete-dialog">
      <DialogTitle>
        Delete {selected.length} Configuration{selected.length > 1 && "s"}?
      </DialogTitle>

      <DialogContent>
        <Typography>
          Deleting this configuration will remove it from BindPlane, however any
          agents currently using this configuration will continue to do so.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onDelete}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
