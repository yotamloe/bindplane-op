import { Button, Stack, Typography } from "@mui/material";
import { memo, useState } from "react";
import { CardContainer } from "../../../components/CardContainer";
import {
  DestinationType,
  ResourceConfiguration,
  SourceType,
  useDestinationsAndTypesQuery,
} from "../../../graphql/generated";
import { ResourceDestinationCard } from "./ResourceDestinationCard";
import { PlusCircleIcon } from "../../../components/Icons";
import {
  DialogResource,
  ResourceDialog,
} from "../../../components/ResourceDialog";
import { applyResources } from "../../../utils/rest/apply-resources";
import { useSnackbar } from "notistack";
import { ShowPageConfig } from ".";
import { UpdateStatus } from "../../../types/resources";
import { BPResourceConfiguration } from "../../../utils/classes/resource-configuration";
import { InlineDestinationCard } from "./InlineDestinationCard";
import { BPConfiguration, BPDestination } from "../../../utils/classes";

import styles from "./configuration-page.module.scss";
import mixins from "../../../styles/mixins.module.scss";

type ResourceType = SourceType | DestinationType;

const DestinationsSectionComponent: React.FC<{
  configuration: NonNullable<ShowPageConfig>;
  destinations: ResourceConfiguration[];
  refetch: () => {};
}> = ({ configuration, refetch, destinations }) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { data } = useDestinationsAndTypesQuery({
    fetchPolicy: "network-only",
  });
  const { enqueueSnackbar } = useSnackbar();

  async function onNewDestinationSave(
    values: { [key: string]: any },
    destinationType: ResourceType
  ) {
    if (configuration == null) {
      console.error(
        "cannot save destination, current configuration is null or undefined."
      );
      return;
    }

    const destination = new BPDestination({
      metadata: {
        name: values.name,
        id: values.name,
      },
      spec: {
        parameters: [],
        type: destinationType.metadata.name,
      },
    });

    destination.setParamsFromMap(values);

    const updatedConfiguration = new BPConfiguration(configuration);
    updatedConfiguration.addDestination({ name: destination.name() });

    try {
      const { updates } = await applyResources([
        destination,
        updatedConfiguration,
      ]);

      const destinationUpdate = updates.find(
        (u) => u.resource.metadata.name === destination.name()
      );

      if (destinationUpdate == null) {
        throw new Error(
          `failed to create destination, no update returned with name ${values.name}`
        );
      }

      if (destinationUpdate.status !== UpdateStatus.CREATED) {
        throw new Error(
          `failed to create destination, got update status ${destinationUpdate.status}`
        );
      }

      const configurationUpdate = updates.find(
        (u) => u.resource.metadata.name === updatedConfiguration.name()
      );

      if (configurationUpdate == null) {
        throw new Error(
          `failed to update configuration, no update returned with name ${values.name}`
        );
      }

      if (configurationUpdate.status !== UpdateStatus.CONFIGURED) {
        throw new Error(
          `failed to update configuration, got update status ${configurationUpdate.status}`
        );
      }

      setAddDialogOpen(false);
      enqueueSnackbar(`Created destination ${destination.name()}!`, {
        variant: "success",
      });
      refetch();
    } catch (err) {
      enqueueSnackbar("Failed to create destination.", { variant: "error" });
      console.error(err);
    }
  }

  async function addExistingDestination(existingDestination: DialogResource) {
    const config = new BPConfiguration(configuration);
    config.addDestination({ name: existingDestination.metadata.name });

    try {
      const update = await config.apply();
      if (update.status === UpdateStatus.INVALID) {
        console.error(update);
        throw new Error(
          `failed to update resource, got status ${update.status}`
        );
      }

      setAddDialogOpen(false);
      refetch();
    } catch (err) {
      enqueueSnackbar("Failed to add destination.", { variant: "error" });
    }
  }

  return (
    <>
      <CardContainer>
        <div className={styles["title-button-row"]}>
          <Typography variant="h5">Destinations</Typography>
          <Button
            onClick={() => setAddDialogOpen(true)}
            variant="contained"
            classes={{ root: mixins["float-right"] }}
            startIcon={<PlusCircleIcon />}
          >
            Add Destination
          </Button>
        </div>

        <Stack direction="row" spacing={2}>
          {destinations.map((d, ix) => {
            const destinationConfig = new BPResourceConfiguration(d);

            return destinationConfig.isInline() ? (
              <InlineDestinationCard
                key={ix}
                destination={d}
                destinationIndex={ix}
                configuration={configuration}
                refetch={refetch}
              />
            ) : (
              <ResourceDestinationCard
                key={ix}
                destination={d}
                destinationIndex={ix}
                configuration={configuration}
                refetch={refetch}
              />
            );
          })}
        </Stack>
      </CardContainer>

      <ResourceDialog
        title={"Add a Destination"}
        kind="destination"
        resources={data?.destinations ?? []}
        resourceTypes={data?.destinationTypes ?? []}
        open={addDialogOpen}
        onSaveNew={onNewDestinationSave}
        onSaveExisting={addExistingDestination}
        onClose={() => setAddDialogOpen(false)}
      />
    </>
  );
};

export const DestinationsSection = memo(DestinationsSectionComponent);
