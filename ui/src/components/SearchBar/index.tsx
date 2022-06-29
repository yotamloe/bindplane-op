import {
  Autocomplete,
  AutocompleteInputChangeReason,
  AutocompleteRenderInputParams,
  Popper,
  PopperProps,
} from "@mui/material";
import React, { memo, useRef, useState } from "react";
import { Suggestion } from "../../graphql/generated";
import { SearchInput } from "./input";

import styles from "./search-bar.module.scss";
import mixins from "../../styles/mixins.module.scss";

type AutocompleteValue = Suggestion | string;

interface SearchBarProps {
  suggestions?: Suggestion[] | null;
  suggestionQuery?: string | null;
  initialQuery?: string;
  filterOptions?: Suggestion[];
  onQueryChange: (v: string) => void;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  filterOptions,
  suggestions,
  suggestionQuery,
  initialQuery,
  onQueryChange,
}) => {
  const popperElRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState(initialQuery ?? "");

  function handleInputChange(
    e: React.SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason
  ) {
    // Change the value from user input, not programmatic changes from selecting a suggestion
    if (reason === "input") {
      onQueryChange(value);
      setQuery(value);
    }
  }

  function handleAutocompleteChange(
    e: React.SyntheticEvent,
    suggestion: AutocompleteValue
  ) {
    if (typeof suggestion !== "string") {
      onQueryChange(suggestion.query);
      setQuery(suggestion.query);
    }
  }

  function handleFilterClick(query: string) {
    setQuery(query);
    onQueryChange(query);
  }

  function renderSearchInput(params: AutocompleteRenderInputParams) {
    return (
      <SearchInput
        filterOptions={filterOptions}
        inputValue={query}
        popperElRef={popperElRef}
        {...params}
        onFilterClick={handleFilterClick}
      />
    );
  }

  function renderPopper(props: PopperProps) {
    // It's unclear why, but we need to override the style here
    // for the popper to position correctly.
    return <Popper {...props} style={{}} anchorEl={popperElRef.current} />;
  }

  const filteredSuggestions = relevantSuggestions(
    query,
    suggestions,
    suggestionQuery
  );

  return (
    <Autocomplete
      classes={{
        root: mixins["mb-1"],
        listbox: styles.listbox,
        popper: styles.popper,
        option: styles.option,
        paper: styles.paper,
      }}
      onClose={(e: React.SyntheticEvent, reason) => {
        if (reason === "selectOption") {
          return;
        }
        setOpen(false);
      }}
      onOpen={() => setOpen(true)}
      open={open}
      options={filteredSuggestions}
      autoHighlight
      inputValue={query}
      size="small"
      getOptionLabel={(s: Suggestion | string) => {
        if (typeof s === "object") {
          return s.label;
        } else {
          return s;
        }
      }}
      freeSolo
      disableClearable
      // Overrides the autocomplete behavior
      filterOptions={(x) => x}
      onInputChange={handleInputChange}
      onChange={handleAutocompleteChange}
      renderInput={renderSearchInput}
      PopperComponent={renderPopper}
    />
  );
};

/**
 * Relevant suggestions returns the suggestions only if they are not null
 * and the given query matches the suggestionQuery
 */
export function relevantSuggestions(
  query: string,
  suggestions?: Suggestion[] | null,
  suggestionQuery?: string | null
): Suggestion[] {
  if (query !== suggestionQuery || suggestions == null) return [];
  return suggestions;
}

export const SearchBar = memo(SearchBarComponent);
