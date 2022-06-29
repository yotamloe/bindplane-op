import { Typography, Button, IconButton } from "@mui/material";
import { ChangeEvent, memo, useRef, useState } from "react";
import { CardContainer } from "../../../components/CardContainer";
import { EditIcon } from "../../../components/Icons";
import { YamlEditor } from "../../../components/YamlEditor";
import {
  applyResources,
  getResourceStatusFromUpdates,
} from "../../../utils/rest/apply-resources";
import { ShowPageConfig } from ".";
import { cloneIntoConfig } from "./utils";
import { UpdateStatus } from "../../../types/resources";
import { renderInvalidReason } from "../../../utils/forms/renderInvalidReason";

import styles from "./configuration-page.module.scss";
import mixins from "../../../styles/mixins.module.scss";

const ConfigurationSectionComponent: React.FC<{
  configuration: NonNullable<ShowPageConfig>;
  refetch: () => void;
  onSaveSuccess: () => void;
  onSaveError: () => void;
}> = ({ configuration, refetch, onSaveError, onSaveSuccess }) => {
  const [editingRawConfig, setEditingRawConfig] = useState(false);
  const [rawConfigEditValue, setRawConfigEditValue] = useState(
    configuration?.spec.raw ?? ""
  );
  const [invalidConfigReason, setInvalidConfigReason] =
    useState<null | string>(null);

  const rawConfigInputRef = useRef<HTMLTextAreaElement | null>(null);

  async function saveRawConfig() {
    if (rawConfigInputRef.current == null) {
      return;
    }

    try {
      const newConfig = cloneIntoConfig(configuration);

      newConfig.spec.raw = rawConfigInputRef.current.value;

      const { updates } = await applyResources([newConfig]);

      // Verify that we got update status Configured or Unchanged
      // If UpdateStatus.Invalid set the invalid reason.
      const resourceStatus = getResourceStatusFromUpdates(
        updates,
        newConfig.metadata.name
      );
      if (resourceStatus == null) {
        throw new Error(
          `No configuration with name ${newConfig.metadata.name} returned in response.`
        );
      }

      switch (resourceStatus.status) {
        case UpdateStatus.CONFIGURED:
        case UpdateStatus.UNCHANGED:
          onSaveSuccess();
          setEditingRawConfig(false);
          refetch();
          return;
        case UpdateStatus.INVALID:
          setInvalidConfigReason(
            resourceStatus.reason ?? "Invalid configuration."
          );
          return;
        default:
          throw new Error(
            `Got unexpected update status: ${resourceStatus.status}`
          );
      }
    } catch (err) {
      onSaveError();
      console.error(err);
    }
  }

  function handleCancelEdit() {
    setEditingRawConfig(false);
    setRawConfigEditValue(configuration.spec.raw ?? "");
    setInvalidConfigReason(null);
  }

  return (
    <CardContainer>
      <div className={styles["title-button-row"]}>
        <Typography variant="h5">Configuration</Typography>
        {editingRawConfig ? (
          <div>
            <Button
              size="small"
              color="inherit"
              onClick={handleCancelEdit}
              classes={{ root: mixins["mr-2"] }}
            >
              Cancel
            </Button>
            <Button
              data-testid="save-button"
              size="small"
              color="primary"
              variant="outlined"
              onClick={saveRawConfig}
            >
              Save
            </Button>
          </div>
        ) : (
          <IconButton
            size="small"
            onClick={() => setEditingRawConfig(true)}
            data-testid="edit-configuration-button"
          >
            <EditIcon />
          </IconButton>
        )}
      </div>

      {editingRawConfig ? (
        <>
          <YamlEditor
            value={rawConfigEditValue}
            onValueChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setRawConfigEditValue(e.target.value);
            }}
            inputRef={rawConfigInputRef}
          />
          {invalidConfigReason && renderInvalidReason(invalidConfigReason)}
        </>
      ) : (
        <YamlEditor
          readOnly
          value={configuration.spec?.raw ?? ""}
          limitHeight
        />
      )}
    </CardContainer>
  );
};

export const ConfigurationSection = memo(ConfigurationSectionComponent);
