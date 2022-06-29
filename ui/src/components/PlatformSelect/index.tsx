import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SelectProps,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import React, { useState } from "react";

import styles from "./platform-select.module.scss";

export interface Platform {
  label: string;
  value: string;
  backgroundImage: string;
}

const PLATFORMS: Platform[] = [
  {
    label: "Linux",
    value: "linux",
    backgroundImage: "url('/icons/linux-platform-icon.svg",
  },
  {
    label: "macOS",
    value: "macos",
    backgroundImage: "url('/icons/macos-platform-icon.svg",
  },

  {
    label: "Windows",
    value: "windows",
    backgroundImage: "url('/icons/windows-platform-icon.svg",
  },
];

interface PlatformSelectProps extends SelectProps {
  onPlatformSelected: (value: string) => void;
  helperText?: string | null;
}

export const PlatformSelect: React.FC<PlatformSelectProps> = ({
  onPlatformSelected,
  size,
  error,
  helperText,
  ...rest
}) => {
  const [platform, setPlatform] = useState<Platform | null>(
    PLATFORMS.find((p) => p.value === rest.value) ?? null
  );

  function handleSelect(e: SelectChangeEvent<unknown>) {
    const value = e.target.value as string;
    setPlatform(PLATFORMS.find((p) => p.value === value)!);
    onPlatformSelected(value);
  }

  return (
    <FormControl
      fullWidth
      margin="normal"
      variant="outlined"
      error={error}
      classes={{ root: styles.root }}
      size={size}
    >
      <InputLabel id="platform-label">Platform</InputLabel>
      <Select
        labelId="platform-label"
        id="platform"
        label="Platform"
        onChange={handleSelect}
        value={platform?.value}
        startAdornment={
          platform?.value ? (
            <span
              style={{
                backgroundImage: PLATFORMS.find((p) => p.value === rest?.value)
                  ?.backgroundImage,
              }}
              className={styles["value-icon"]}
            />
          ) : undefined
        }
        inputProps={{
          "data-testid": "platform-select-input",
        }}
        size={size}
        {...rest}
      >
        {PLATFORMS.map((p) => (
          <MenuItem
            key={p.value}
            value={p.value}
            classes={{ root: styles.item }}
          >
            <span
              style={{ backgroundImage: p.backgroundImage }}
              className={styles.icon}
            ></span>
            {p.label}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
};
