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
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSortSuggestions(t *testing.T) {
	tests := []struct {
		name   string
		input  []*Suggestion
		expect []*Suggestion
	}{
		{
			input:  []*Suggestion{},
			expect: []*Suggestion{},
		},
		{
			input: []*Suggestion{
				{
					Label: "apple",
					Query: "apple",
					Score: ScorePrefix,
				},
				{
					Label: "pear",
					Query: "pear",
					Score: ScorePrefix,
				},
				{
					Label: "melon",
					Query: "melon",
					Score: ScorePrefix,
				},
			},
			expect: []*Suggestion{
				{
					Label: "apple",
					Query: "apple",
					Score: ScorePrefix,
				},
				{
					Label: "melon",
					Query: "melon",
					Score: ScorePrefix,
				},
				{
					Label: "pear",
					Query: "pear",
					Score: ScorePrefix,
				},
			},
		},
		{
			input: []*Suggestion{
				{
					Label: "apple",
					Query: "apple",
					Score: ScorePrefix,
				},
				{
					Label: "pear",
					Query: "pear",
					Score: ScoreExact,
				},
				{
					Label: "melon",
					Query: "melon",
					Score: ScorePrefix,
				},
			},
			expect: []*Suggestion{
				{
					Label: "pear",
					Query: "pear",
					Score: ScoreExact,
				},
				{
					Label: "apple",
					Query: "apple",
					Score: ScorePrefix,
				},
				{
					Label: "melon",
					Query: "melon",
					Score: ScorePrefix,
				},
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			// sort in place
			SortSuggestions(test.input)
			require.ElementsMatch(t, test.expect, test.input)
		})
	}
}
