import { Autocomplete, Chip, InputAdornment, TextField } from "@mui/material";
import { isArray, isEmpty } from "lodash";
import { useState } from "react";
import { SearchIcon } from "../Icons";

import styles from "./live-tail-console.module.scss";

interface Props {
  value: string[];
  onValueChange: (s: string[]) => void;
}

export const LTSearchBar: React.FC<Props> = ({ value, onValueChange }) => {
  const [inputValue, setInputValue] = useState("");

  // handleChipClick edits the selected chips value.
  function handleChipClick(ix: number) {
    if (!isArray(value)) {
      return;
    }

    // Edit the chips value
    setInputValue(value[ix]);

    // Remove the chip from the values because its being edited.
    const copy = [...value];
    copy.splice(ix, 1);
    onValueChange(copy);
  }

  // Make sure we "enter" the value if a user leaves the
  // input without hitting enter
  function handleBlur() {
    if (!isEmpty(inputValue)) {
      setInputValue("");
      onValueChange && onValueChange([...value, inputValue]);
    }
  }

  return (
    <Autocomplete
      options={[]}
      multiple
      disableClearable
      freeSolo
      // value and onChange pertain to the string[] value of the input
      value={value}
      onChange={(e, v: string[]) => onValueChange(v)}
      // inputValue and onInputChange refer to the latest string value being entered
      inputValue={inputValue}
      onInputChange={(e, newValue) => setInputValue(newValue)}
      onBlur={handleBlur}
      renderTags={(value: readonly string[], getTagProps) => {
        return value.map((option: string, index: number) => (
          <Chip
            size="small"
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
            classes={{ label: styles.chip }}
            onClick={() => handleChipClick(index)}
          />
        ));
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
          size={"small"}
        />
      )}
    />
  );
};
