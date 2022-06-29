import { Box, Typography } from "@mui/material";

export function renderInvalidReason(reason: string): JSX.Element {
  // Split up the invalid reason by new line and map to typography elements.
  const lines = reason.split("\n");
  return (
    <Box marginTop={1}>
      {lines.map((l) => (
        <Typography fontSize={12} fontFamily="monospace" key={l} color="error">
          {l}
        </Typography>
      ))}
    </Box>
  );
}
