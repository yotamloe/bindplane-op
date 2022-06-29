import { Card } from "@mui/material";
import { Source } from "../../../../graphql/generated";

import styles from "./assisted-config-wizard.module.scss";

interface SourceCardProps {
  source: Source;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  return (
    <Card className={styles["resource-card"]}>
      {source.metadata.displayName}
    </Card>
  );
};
