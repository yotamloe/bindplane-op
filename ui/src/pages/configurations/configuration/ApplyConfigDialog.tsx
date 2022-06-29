import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
} from "@mui/material";
import { GridRowId } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { ShowPageConfig } from ".";
import { AgentsTable } from "../../../components/Tables/AgentsTable";
import { labelAgents } from "../../../utils/rest/label-agents";
import { initQuery } from "./utils";

interface ApplyConfigDialogProps extends DialogProps {
  configuration: NonNullable<ShowPageConfig>;
  onCancel: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export const ApplyConfigDialog: React.FC<ApplyConfigDialogProps> = ({
  configuration,
  onCancel,
  onSuccess,
  onError,
  ...dialogProps
}) => {
  const [applyingLabels, setApplyingLabels] = useState(false);
  const [agentsToApply, setAgentsToApply] = useState<GridRowId[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  function handleAgentsSelected(a: GridRowId[]) {
    setAgentsToApply(a);
  }

  async function applyAgentLabels() {
    setApplyingLabels(true);

    try {
      const matchLabels = configuration.spec.selector?.matchLabels;
      if (matchLabels == null) {
        throw new Error(
          "Cannot apply labels, configuration matchLabels are undefined."
        );
      }

      const ids = [];
      for (const id of agentsToApply) {
        if (typeof id === "string") {
          ids.push(id);
        }
      }

      // Since we're overwriting these labels the only error returned could be
      // if the agent with specified ID doesn't exist - which is unlikely, but
      // not impossible.  For now we'll simply alert and console.error
      const errors = await labelAgents(ids, matchLabels, true);
      if (errors.length > 0) {
        console.error("Failed to label some agents.", errors);
        enqueueSnackbar("Failed to label some agents.", { variant: "warning" });
      }

      onSuccess();
      return;
    } catch (err) {
      setApplyingLabels(false);
      onError();
      console.error(err);
      return;
    }
  }

  return (
    <Dialog {...dialogProps}>
      <DialogContent>
        <DialogTitle>Apply Configuration to Agents</DialogTitle>
        <DialogContent>
          <AgentsTable
            onAgentsSelected={handleAgentsSelected}
            initQuery={initQuery(
              configuration.spec.selector?.matchLabels,
              configuration.metadata.labels.platform
            )}
          />
        </DialogContent>
      </DialogContent>
      <DialogActions>
        {applyingLabels && <CircularProgress size={20} />}
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="contained"
          disabled={agentsToApply.length === 0}
          onClick={applyAgentLabels}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};
