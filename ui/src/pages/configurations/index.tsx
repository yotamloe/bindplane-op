import { Button } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { CardContainer } from "../../components/CardContainer";
import { ConfigurationsTable } from "../../components/Tables/ConfigurationTable";
import { PlusCircleIcon } from "../../components/Icons";

import mixins from "../../styles/mixins.module.scss";

export const ConfigurationsPage: React.FC = () => {
  return (
    <CardContainer>
      <Button
        component={Link}
        to="/configurations/new"
        variant="contained"
        classes={{ root: mixins["float-right"] }}
        startIcon={<PlusCircleIcon />}
      >
        New Configuration
      </Button>

      <ConfigurationsTable />
    </CardContainer>
  );
};
