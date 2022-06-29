import React from "react";
import {
  AutocompleteRenderInputParams,
  Paper,
  Button,
  Menu,
  MenuItem,
  Divider,
  InputBase,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Suggestion } from "../../graphql/generated";

import styles from "./search-bar.module.scss";
import mixins from "../../styles/mixins.module.scss";

export const SearchInput: React.FC<
  AutocompleteRenderInputParams & {
    inputValue: string;
    popperElRef: React.MutableRefObject<HTMLSpanElement | null>;
    // The suggestions to display in the filter drop down.
    filterOptions?: Suggestion[];
    onFilterClick: (query: string) => void;
  }
> = ({ inputValue, popperElRef, onFilterClick, filterOptions, ...params }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleFilterMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterOptionClick = (query: string) => {
    onFilterClick(query);
    setAnchorEl(null);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <Paper
      classes={{ root: styles.input }}
      variant={"outlined"}
      ref={params.InputProps.ref}
    >
      {filterOptions && (
        <>
          <Button
            variant="text"
            color="inherit"
            onClick={handleFilterMenuClick}
            endIcon={<KeyboardArrowDownIcon />}
          >
            Filters
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {filterOptions.map((o) => (
              <MenuItem
                key={o.label}
                onClick={() => handleFilterOptionClick(o.query)}
              >
                {o.label}
              </MenuItem>
            ))}
          </Menu>
          <Divider
            flexItem
            classes={{ root: mixins["mr-1"] }}
            orientation="vertical"
          />
        </>
      )}
      <InputBase
        aria-label="Filter by field or label"
        classes={{ root: mixins["ml-2"] }}
        placeholder="Filter by field or label"
        style={{
          width: getInputWidth(inputValue),
          fontFamily: "monospace",
          fontSize: 12,
        }}
        inputProps={params.inputProps}
      />
      {/* This span is used to place the autocomplete popover */}
      <span ref={popperElRef} />
    </Paper>
  );
};

function getInputWidth(value: string): number {
  const charWidth = 7.5;
  if (value === "") return 200;
  return Math.ceil(value.length * charWidth);
}
