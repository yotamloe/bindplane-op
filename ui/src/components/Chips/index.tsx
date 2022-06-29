import { Chip } from "@mui/material";
import { PipelineType } from "../../graphql/generated";
import styles from "./chips.module.scss";

interface ChipProps {
  hovered?: boolean;
  telemetryType: PipelineType;
}

export const TelemetryChip: React.FC<ChipProps> = ({
  hovered,
  telemetryType,
}) => {
  return (
    <Chip
      label={telemetryType}
      size="small"
      variant="outlined"
      classes={{
        root: hovered ? styles.hovered : styles.grey,
      }}
    />
  );
};
