import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
} from "@mui/material";

interface ConfirmDeleteProps extends DialogProps {
  onDelete: () => void;
  onCancel: () => void;
  action: "delete" | "remove";
  children: JSX.Element;
  title?: string;
}

export const ConfirmDeleteResourceDialog: React.FC<ConfirmDeleteProps> = ({
  onDelete,
  onCancel,
  action,
  children,
  title,
  ...dialogProps
}) => {
  return (
    <Dialog {...dialogProps} data-testid="confirm-delete-dialog">
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          color="error"
          onClick={onDelete}
          data-testid="confirm-delete-dialog-delete-button"
        >
          {action === "delete" ? "Delete" : "Remove"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
