import { gql } from "@apollo/client";
import { GridSelectionModel } from "@mui/x-data-grid";
import { useComponentsQuery } from "../../../graphql/generated";
import { ComponentsDataGrid } from "./ComponentsDataGrid";
import { Typography, FormControl, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { ConfirmDeleteResourceDialog } from "../../ConfirmDeleteResourceDialog";
import { useSnackbar } from "notistack";
import {
  deleteResources,
  MinimumDeleteResource,
} from "../../../utils/rest/delete-resources";
import { ResourceKind, ResourceStatus } from "../../../types/resources";
import { FailedDeleteDialog } from "./FailedDeleteDialog";
import { EditDestinationDialog } from "./EditDestinationDialog";

import mixins from "../../../styles/mixins.module.scss";

gql`
  query Components {
    sources {
      kind
      metadata {
        name
      }
      spec {
        type
      }
    }
    destinations {
      kind
      metadata {
        name
      }
      spec {
        type
      }
    }
  }
`;

export const ComponentsTable: React.FC = () => {
  // Selected is an array of names of components in the form
  // <Kind>|<Name>
  const [selected, setSelected] = useState<GridSelectionModel>([]);

  // Used to control the delete confirmation modal.
  const [open, setOpen] = useState<boolean>(false);

  const [editingDestination, setEditingDestination] =
    useState<string | null>(null);

  const [failedDeletes, setFailedDeletes] = useState<ResourceStatus[]>([]);
  const [failedDeletesOpen, setFailedDeletesOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const { data, loading, refetch, error } = useComponentsQuery({
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (error != null) {
      enqueueSnackbar("There was an error retrieving data.", {
        variant: "error",
      });
    }
  }, [enqueueSnackbar, error]);

  useEffect(() => {
    if (failedDeletes.length > 0) {
      setFailedDeletesOpen(true);
    }
  }, [failedDeletes, setFailedDeletesOpen]);

  function onComponentsSelected(s: GridSelectionModel) {
    setSelected(s);
  }

  function onAcknowledge() {
    setFailedDeletesOpen(false);
  }

  function handleEditSaveSuccess() {
    refetch();
    setEditingDestination(null);
  }

  async function deleteComponents() {
    try {
      const items = resourcesFromSelected(selected);
      const { updates } = await deleteResources(items);
      setOpen(false);

      const failures = updates.filter((u) => u.status !== "deleted");
      setFailedDeletes(failures);

      refetch();
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to delete components.", { variant: "error" });
    }
  }

  return (
    <>
      <div className={mixins.flex}>
        <Typography variant="h5" className={mixins["mb-5"]}>
          Components
        </Typography>
        {selected.length > 0 && (
          <FormControl classes={{ root: mixins["ml-5"] }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpen(true)}
            >
              Delete {selected.length} Component
              {selected.length > 1 && "s"}
            </Button>
          </FormControl>
        )}
      </div>
      <ComponentsDataGrid
        loading={loading}
        queryData={data ?? { destinations: [], sources: [] }}
        onComponentsSelected={onComponentsSelected}
        disableSelectionOnClick
        checkboxSelection
        onEditDestination={(name: string) => setEditingDestination(name)}
      />
      <ConfirmDeleteResourceDialog
        open={open}
        onClose={() => setOpen(false)}
        onDelete={deleteComponents}
        onCancel={() => setOpen(false)}
        action={"delete"}
      >
        <Typography>
          Are you sure you want to delete {selected.length} component
          {selected.length > 1 && "s"}?
        </Typography>
      </ConfirmDeleteResourceDialog>

      <FailedDeleteDialog
        open={failedDeletesOpen}
        failures={failedDeletes}
        onAcknowledge={onAcknowledge}
        onClose={() => {}}
      />

      {editingDestination && (
        <EditDestinationDialog
          name={editingDestination}
          onCancel={() => setEditingDestination(null)}
          onSaveSuccess={handleEditSaveSuccess}
        />
      )}
    </>
  );
};

export function resourcesFromSelected(
  selected: GridSelectionModel
): MinimumDeleteResource[] {
  return selected.reduce<MinimumDeleteResource[]>((prev, cur) => {
    if (typeof cur !== "string") {
      console.error(`Unexpected type for GridRowId: ${typeof cur}"`);
      return prev;
    }
    const [kind, name] = cur.split("|");

    if (kind == null || name == null) {
      console.error(`Malformed grid row ID: ${cur}`);
      return prev;
    }

    let resourceKind: ResourceKind;
    switch (kind) {
      case ResourceKind.DESTINATION:
        resourceKind = ResourceKind.DESTINATION;
        break;
      case ResourceKind.SOURCE:
        resourceKind = ResourceKind.SOURCE;
        break;
      default:
        console.error(`Unexpected ResourceKind parsed from GridRowId: ${cur}.`);
        return prev;
    }

    prev.push({ kind: resourceKind, metadata: { name } });
    return prev;
  }, []);
}
