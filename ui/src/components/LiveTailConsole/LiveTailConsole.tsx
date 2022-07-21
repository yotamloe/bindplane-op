import { Grid } from "@mui/material";
import { useState } from "react";
import styles from "./live-tail-console.module.scss";
import { LTSearchBar } from "./SearchBar";

export const LiveTailConsole: React.FC = () => {
  const [filters, setFilters] = useState<string[]>([]);

  function handleFilterChange(v: string[]) {
    console.log(v);
    setFilters(v);
  }

  return (
    <div className={styles.container}>
      <Grid container height={"100%"}>
        <Grid item xs={12}>
          <div className={styles.console}></div>
        </Grid>
      </Grid>

      <LTSearchBar value={filters} onValueChange={handleFilterChange} />
    </div>
  );
};
