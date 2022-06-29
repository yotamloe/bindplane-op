import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { classes } from "../../utils/styles";
import { Agent, Config } from "./types";
import { filterConfigsByPlatform } from "./util";

import mixins from "../../styles/mixins.module.scss";

interface SelectProps {
  agent: Agent;
  setSelectedConfig: (c: Config) => void;
  selectedConfig?: Config;
  configurations: Config[];
}

export const ConfigurationSelect: React.FC<SelectProps> = ({
  agent,
  setSelectedConfig,
  configurations,
  selectedConfig,
}) => {
  function onSelectChange(e: SelectChangeEvent<string>) {
    setSelectedConfig(
      configurations.find((c) => c.metadata.name === e.target.value)!
    );
  }

  // Only display configurations whose platform label matches the agent
  const matchingConfigs = filterConfigsByPlatform(
    configurations,
    agent.platform!
  );

  return (
    <FormControl
      classes={{ root: classes([mixins["form-width"], mixins["mb-2"]]) }}
      size="small"
    >
      <InputLabel id="configuration-select-label">
        Select Configuration
      </InputLabel>

      <Select
        labelId="configuration-select-label"
        id="configuration"
        label="Select Configuration"
        onChange={onSelectChange}
        value={selectedConfig?.metadata.name ?? ""}
      >
        {matchingConfigs.map((c: Config) => (
          <MenuItem key={c.metadata.name} value={c.metadata.name}>
            {c.metadata.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
