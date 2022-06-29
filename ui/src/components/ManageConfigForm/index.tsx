import { Button, Typography } from "@mui/material";
import { useState } from "react";
import { GetAgentAndConfigurationsQuery } from "../../graphql/generated";
import { classes } from "../../utils/styles";
import { YamlEditor } from "../YamlEditor";
import { patchConfigLabel } from "../../utils/patch-config-label";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Config } from "./types";
import { ConfigurationSelect } from "./ConfigurationSelect";
import { filterConfigsByPlatform } from "./util";

import mixins from "../../styles/mixins.module.scss";
import styles from "./apply-config-form.module.scss";

interface ManageConfigFormProps {
  agent: NonNullable<GetAgentAndConfigurationsQuery["agent"]>;
  configurations: Config[];
  onImport: () => void;
}

export const ManageConfigForm: React.FC<ManageConfigFormProps> = ({
  agent,
  configurations,
  onImport,
}) => {
  const snackbar = useSnackbar();

  const configResourceName = agent?.configurationResource?.metadata.name;

  const [editing, setEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Config | undefined>(
    configurations.find((c) => c.metadata.name === configResourceName)
  );

  const matchingConfigs = filterConfigsByPlatform(
    configurations,
    agent.platform
  );

  async function onApplyConfiguration() {
    try {
      await patchConfigLabel(agent.id, selectedConfig!.metadata.name);

      setEditing(false);
    } catch (err) {
      snackbar.enqueueSnackbar("Failed to patch label.", {
        color: "error",
        autoHideDuration: 5000,
      });
    }
  }

  function onCancelEdit() {
    setEditing(false);
    setSelectedConfig(
      configurations.find((c) => c.metadata.name === configResourceName)
    );
  }

  const EditConfiguration: React.FC = () => {
    return (
      <>
        <ConfigurationSelect
          agent={agent}
          setSelectedConfig={setSelectedConfig}
          selectedConfig={selectedConfig}
          configurations={configurations}
        />

        {selectedConfig?.spec.raw && (
          <YamlEditor value={selectedConfig.spec?.raw ?? ""} readOnly />
        )}
      </>
    );
  };

  const ShowConfiguration: React.FC = () => {
    return (
      <>
        {configResourceName ? (
          <>
            <Typography classes={{ root: mixins["mb-2"] }}>
              <Link to={`/configurations/${configResourceName}`}>
                {configResourceName}
              </Link>
            </Typography>
          </>
        ) : (
          <>
            <Typography variant={"body2"} classes={{ root: mixins["mb-2"] }}>
              This agent configuration is not currently managed by BindPlane.
              Click import to pull this agent&apos;s configuration in as a new
              managed configuration.
            </Typography>
          </>
        )}
        {matchingConfigs.length > 0 && (
          <Typography variant={"body2"} classes={{ root: mixins["mb-2"] }}>
            Click edit to apply another configuration.
          </Typography>
        )}

        <YamlEditor value={agent.configuration?.Collector ?? ""} readOnly />
      </>
    );
  };

  return (
    <>
      <div
        className={classes([
          mixins.flex,
          mixins["align-center"],
          mixins["mb-3"],
        ])}
      >
        <Typography variant="h6">Configuration</Typography>
        <div className={styles["title-button-group"]}>
          {editing ? (
            <>
              <Button variant="outlined" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onApplyConfiguration}
                classes={{ root: mixins["ml-2"] }}
              >
                Apply
              </Button>
            </>
          ) : (
            <>
              {configResourceName == null && (
                <>
                  <Button variant="contained" onClick={onImport}>
                    Import
                  </Button>
                </>
              )}
              {configurations.length > 0 && (
                <Button
                  classes={{ root: mixins["ml-2"] }}
                  variant="outlined"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {editing ? <EditConfiguration /> : <ShowConfiguration />}
    </>
  );
};
