import { Box, Button, Paper, Popover, Typography } from "@mui/material";
import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import styles from "./code-block.module.scss";
import mixins from "../../styles/mixins.module.scss";

interface CodeBlockProps {
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ value }) => {
  const CopyButton: React.FC = () => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
      null
    );
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setTimeout(() => setAnchorEl(null), 750);
    };

    const open = Boolean(anchorEl);
    return (
      <>
        <Popover
          anchorEl={anchorEl}
          open={open}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Typography classes={{ root: mixins["m-2"] }}>Copied!</Typography>
        </Popover>

        <CopyToClipboard text={value}>
          <Button size="small" variant="text" onClick={handleClick}>
            Copy
          </Button>
        </CopyToClipboard>
      </>
    );
  };
  return (
    <Paper variant="outlined" classes={{ root: styles.paper }}>
      <Box component="div" className={styles["block-header"]}>
        <CopyButton />
      </Box>
      <Box component="div" className={styles["block-content"]}>
        {value}
      </Box>
    </Paper>
  );
};
