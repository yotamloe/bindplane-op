// Copyright  observIQ, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package search

import (
	"sort"
	"strings"
)

const (
	// ScoreExact is for exact matches where the query matches the value
	ScoreExact int = 100
	// ScorePrefix is for matches where the query is a prefix of the value
	ScorePrefix = 50
	// ScoreSubstring is for matches where the query is a substring of the value
	ScoreSubstring = 25
	// ScoreFuzzy is for matches where the query is a fuzzy match of the value, e.g. "pe" matches apple because it matches
	// the letters in order -p--e.
	ScoreFuzzy = 10
)

// Suggestion represents a single search suggestion for auto-complete
type Suggestion struct {
	// Label can be used to display the suggestion in an auto-complete field
	Label string `json:"label"`
	// Query is the query text that should be used if this suggestion is selected
	Query string `json:"query"`
	// Score provides an indication of how well the suggestion matches the query
	Score int `json:"-"`
}

// ----------------------------------------------------------------------
// sorting

type byLabelAndScore []*Suggestion

func (s byLabelAndScore) Len() int {
	return len(s)
}
func (s byLabelAndScore) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}
func (s byLabelAndScore) Less(i, j int) bool {
	if s[i].Score == s[j].Score {
		// TODO(andy): make this more efficient
		return strings.ToLower(s[i].Label) < strings.ToLower(s[j].Label)
	}
	// high scores appear first
	return s[i].Score > s[j].Score
}

// SortSuggestions sorts alphabetically by score and label
func SortSuggestions(suggestions []*Suggestion) {
	sort.Sort(byLabelAndScore(suggestions))
}
