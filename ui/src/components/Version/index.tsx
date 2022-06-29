import { Typography } from "@mui/material";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";

import styles from "./version.module.scss";

// Version displays the server version received from the /version endpoint.
export const Version: React.FC = () => {
  const [version, setVersion] = useState("");

  useEffect(() => {
    async function fetchVersion() {
      try {
        const resp = await fetch("/v1/version");
        const { commit, tag } = await resp.json();

        if (!isEmpty(tag)) {
          setVersion(tag);
          return;
        }

        if (!isEmpty(commit)) {
          setVersion(commit);
          return;
        }
        setVersion("unknown");
      } catch (err) {
        console.error(err);
        setVersion("unknown");
      }
    }

    fetchVersion();
  }, [setVersion]);

  return (
    <Typography
      variant="body2"
      fontWeight={300}
      classes={{ root: styles.root }}
    >
      BindPlane OP {version}
    </Typography>
  );
};
