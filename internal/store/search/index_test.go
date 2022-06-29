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
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func testIndex() *index {
	return NewInMemoryIndex("test").(*index)
}

func TestIndexFieldExistsQuery(t *testing.T) {
	index := testIndex()

	doc1 := emptyDocument("1")
	doc1.addField("version", "1.0")
	doc1.addField("arch", "arm64")

	doc2 := emptyDocument("2")
	doc2.addField("arch", "arm64")

	index.documents["1"] = doc1
	index.documents["2"] = doc2

	tests := []struct {
		query  string
		expect []string
	}{
		{
			query:  "version:",
			expect: []string{"1"},
		},
		{
			query:  "-version:",
			expect: []string{"2"},
		},
		{
			query:  "arch:",
			expect: []string{"1", "2"},
		},
		{
			query:  "-arch:",
			expect: []string{},
		},
		{
			query:  "-arch: :version",
			expect: []string{},
		},
		{
			query:  "version: arch:",
			expect: []string{"1"},
		},
		{
			query:  "version: arch: ",
			expect: []string{"1"},
		},
		{
			query:  "-version: arch: ",
			expect: []string{"2"},
		},
	}

	for _, test := range tests {
		t.Run(test.query, func(t *testing.T) {
			results, _ := index.Search(context.TODO(), ParseQuery(test.query))
			require.ElementsMatch(t, test.expect, results)
		})
	}
}

func TestIndexQuotedQuery(t *testing.T) {
	index := testIndex()

	doc1 := emptyDocument("1")
	doc1.addField("version", "1.0")
	doc1.addField("arch", "arm64")
	doc1.addField("os", "macOS 12.3")

	doc2 := emptyDocument("2")
	doc2.addField("arch", "arm64")
	doc2.addField("os", "macOS 12.3.1")

	index.Upsert(doc1)
	index.Upsert(doc2)

	v1, _ := index.Search(context.TODO(), ParseQuery(`os:"macOS 12.3"`))
	require.ElementsMatch(t, []string{"1"}, v1)

	v2, _ := index.Search(context.TODO(), ParseQuery(`os:"macOS 12.3.1"`))
	require.ElementsMatch(t, []string{"2"}, v2)
}

func TestIndexMatches(t *testing.T) {
	index := testIndex()

	doc1 := emptyDocument("1")
	doc1.addField("version", "1.0")
	doc1.addField("arch", "arm64")
	doc1.addField("os", "macOS 12.3")
	doc1.buildValues()

	doc2 := emptyDocument("2")
	doc2.addField("arch", "arm64")
	doc2.addField("os", "macOS 12.3.1")
	doc2.buildValues()

	// add documents "1" and "2". note that "3" doesn't exist and will always return false
	index.Upsert(doc1)
	index.Upsert(doc2)

	tests := []struct {
		query  string
		expect map[string]bool
	}{
		{
			query: `os:"macOS 12.3"`,
			expect: map[string]bool{
				"1": true,
				"2": false,
				"3": false,
			},
		},
		{
			query: `os:"macOS 12.3.1"`,
			expect: map[string]bool{
				"1": false,
				"2": true,
				"3": false,
			},
		},
		{
			query: `os:`,
			expect: map[string]bool{
				"1": true,
				"2": true,
				"3": false,
			},
		},
		{
			query: `arch:arm64`,
			expect: map[string]bool{
				"1": true,
				"2": true,
				"3": false,
			},
		},
		{
			query: `arch:amd64`,
			expect: map[string]bool{
				"1": false,
				"2": false,
				"3": false,
			},
		},
		{
			query: "arm",
			expect: map[string]bool{
				"1": true,
				"2": true,
				"3": false,
			},
		},
		{
			query: `"macOS 12.3"`,
			expect: map[string]bool{
				"1": true,
				"2": true,
				"3": false,
			},
		},
		{
			query: `"macos 12.3"`,
			expect: map[string]bool{
				"1": true,
				"2": true,
				"3": false,
			},
		},
		{
			query: `"macOS 12.3"`,
			expect: map[string]bool{
				"1": true,
				"2": true,
				"3": false,
			},
		},
		{
			query: `"macOS 12.3.1"`,
			expect: map[string]bool{
				"1": false,
				"2": true,
				"3": false,
			},
		},
		{
			query: `"amd64 mac"`,
			expect: map[string]bool{
				"1": false,
				"2": false,
				"3": false,
			},
		},
		{
			query: `not present anywhere`,
			expect: map[string]bool{
				"1": false,
				"2": false,
				"3": false,
			},
		},
	}

	for _, test := range tests {
		for id, matches := range test.expect {
			t.Run(fmt.Sprintf("%s-%s", test.query, id), func(t *testing.T) {
				query := ParseQuery(test.query)
				result := index.Matches(query, id)
				require.Equal(t, matches, result)
			})
		}
	}
}

func TestIndexRemove(t *testing.T) {
	index := testIndex()

	doc1 := emptyDocument("1")
	doc1.addField("version", "1.0")
	doc1.addField("arch", "arm64")
	doc1.addField("os", "macOS 12.3")

	doc2 := emptyDocument("2")
	doc2.addField("arch", "arm64")
	doc2.addField("os", "macOS 12.3.1")

	tests := []struct {
		query   string
		expect0 []string
		expect1 []string
		expect2 []string
	}{
		{
			query:   `os:"macOS 12.3"`,
			expect0: []string{"1"},
			expect1: []string{"1"},
			expect2: []string{},
		},
		{
			query:   `os:"macOS 12.3.1"`,
			expect0: []string{"2"},
			expect1: []string{},
			expect2: []string{},
		},
		{
			query:   `arch:arm64`,
			expect0: []string{"1", "2"},
			expect1: []string{"1"},
			expect2: []string{},
		},
		{
			query:   "",
			expect0: []string{},
			expect1: []string{},
			expect2: []string{},
		},
	}

	for _, test := range tests {
		t.Run(test.query, func(t *testing.T) {
			index.Upsert(doc1)
			index.Upsert(doc2)

			result0, err := index.Search(context.TODO(), ParseQuery(test.query))
			require.NoError(t, err)
			require.ElementsMatch(t, test.expect0, result0)

			index.Remove(doc2)
			result1, err := index.Search(context.TODO(), ParseQuery(test.query))
			require.NoError(t, err)
			require.ElementsMatch(t, test.expect1, result1)

			index.Remove(doc1)
			result2, err := index.Search(context.TODO(), ParseQuery(test.query))
			require.NoError(t, err)
			require.ElementsMatch(t, test.expect2, result2)
		})
	}
}

func TestIndexSuggestions(t *testing.T) {
	index := testIndex()

	doc1 := emptyDocument("1")
	doc1.addField("version", "1.0")
	doc1.addField("Arch", "arm64")
	doc1.addField("os", "macOS 12.3")

	doc2 := emptyDocument("2")
	doc2.addField("Arch", "arm64")
	doc2.addField("os", "macOS 12.3.1")

	index.Upsert(doc1)
	index.Upsert(doc2)

	tests := []struct {
		query  string
		expect []*Suggestion
	}{
		{
			query:  ``,
			expect: []*Suggestion{},
		},
		{
			query: `o`,
			expect: []*Suggestion{
				prefixSuggestion("os:", "os:"),
			},
		},
		{
			query: `os:`,
			expect: []*Suggestion{
				prefixSuggestion("macOS 12.3", `os:"macOS 12.3" `),
				prefixSuggestion("macOS 12.3.1", `os:"macOS 12.3.1" `),
			},
		},
		{
			query: `ar`,
			expect: []*Suggestion{
				prefixSuggestion("Arch:", `Arch:`),
			},
		},
		{
			query: `Ar`,
			expect: []*Suggestion{
				prefixSuggestion("Arch:", `Arch:`),
			},
		},
		{
			query: `arch:arm`,
			expect: []*Suggestion{
				prefixSuggestion("arm64", `Arch:arm64 `),
			},
		},
		{
			query: `arch:arm64`,
			expect: []*Suggestion{
				exactSuggestion("arm64", `Arch:arm64 `),
			},
		},
		{
			query: `Arch:arm`,
			expect: []*Suggestion{
				prefixSuggestion("arm64", `Arch:arm64 `),
			},
		},
		{
			query: `+arch:arm`,
			expect: []*Suggestion{
				prefixSuggestion("arm64", `+Arch:arm64 `),
			},
		},
		{
			query: `-arch:arm`,
			expect: []*Suggestion{
				prefixSuggestion("arm64", `-Arch:arm64 `),
			},
		},
		{
			query: `macOS -arch:arm`,
			expect: []*Suggestion{
				prefixSuggestion("arm64", `macOS -Arch:arm64 `),
			},
		},
	}

	for _, test := range tests {
		t.Run(test.query, func(t *testing.T) {
			suggestions, err := index.Suggestions(ParseQuery(test.query))
			require.NoError(t, err)
			require.ElementsMatch(t, test.expect, suggestions)
		})
	}
}

func TestIndexTokenMatchesNilDocument(t *testing.T) {
	query := ParseQuery("test")
	result := tokenMatchesDocument(query.LastToken(), nil)
	require.False(t, result)
}

func TestIndexSearch(t *testing.T) {
	index := testIndex()

	doc1 := emptyDocument("1")
	doc1.addField("version", "1.0")
	doc1.addField("Arch", "arm64")
	doc1.addField("os", "macOS 12.3")
	doc1.addField("sourceType", "docker")
	doc1.addField("sourceType", "macos")
	doc1.addField("sourceType", "redis")
	doc1.labels["app"] = "bindplane"
	doc1.labels["env"] = "production"

	doc2 := emptyDocument("2")
	doc2.addField("Arch", "arm64")
	doc2.addField("os", "macOS 12.3.1")
	doc2.addField("app", "oiq")
	doc2.labels["app"] = "bindplane"
	doc2.labels["env"] = "development"
	doc2.addField("sourceType", "redis")

	index.Upsert(doc1)
	index.Upsert(doc2)

	tests := []struct {
		name   string
		query  string
		expect []string
	}{
		{
			name:   "match on label names",
			query:  "app",
			expect: []string{"1", "2"},
		},
		{
			name:   "match field or label exists",
			query:  "app:",
			expect: []string{"1", "2"},
		},
		{
			name:   "substring match on label names",
			query:  "en",
			expect: []string{"1", "2"},
		},
		{
			name:   "no substring match on field names",
			query:  "arc",
			expect: []string{},
		},
		{
			name:   "query can match field or label",
			query:  "app:oiq",
			expect: []string{"2"},
		},
		{
			name:   "query can match field or label",
			query:  "app:bindplane",
			expect: []string{"1", "2"},
		},
		{
			name:   "query can match multi-valued field (redis)",
			query:  "sourceType:redis",
			expect: []string{"1", "2"},
		},
		{
			name:   "query can match multi-valued field (docker)",
			query:  "sourceType:docker",
			expect: []string{"1"},
		},
		{
			name:   "query can match multi-valued field (macos)",
			query:  "sourceType:macos",
			expect: []string{"1"},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			results, err := index.Search(context.TODO(), ParseQuery(test.query))
			require.NoError(t, err)
			require.ElementsMatch(t, test.expect, results)
		})
	}

	fieldTests := []struct {
		name   string
		field  string
		value  string
		expect []string
	}{
		{
			name:   "query can match multi-valued field (docker)",
			field:  "sourceType",
			value:  "docker",
			expect: []string{"1"},
		},
		{
			name:   "query can match multi-valued field (macos)",
			field:  "sourceType",
			value:  "macos",
			expect: []string{"1"},
		},
	}

	for _, test := range fieldTests {
		t.Run(test.name, func(t *testing.T) {
			results, err := Field(context.TODO(), index, test.field, test.value)
			require.NoError(t, err)
			require.ElementsMatch(t, test.expect, results)
		})
	}
}

func TestIndexSelect(t *testing.T) {
	index := testIndex()

	doc1 := emptyDocument("1")
	doc1.labels["app"] = "bindplane"
	doc1.labels["env"] = "production"

	doc2 := emptyDocument("2")
	doc2.labels["app"] = "bindplane"
	doc2.labels["env"] = "development"

	doc3 := emptyDocument("3")
	doc3.labels["app"] = "cabin"
	doc3.labels["env"] = "production"

	doc4 := emptyDocument("4")
	doc4.labels["app"] = "cabin"
	doc4.labels["env"] = "development"
	doc4.labels["apple"] = "pear"

	doc5 := emptyDocument("5")

	index.Upsert(doc1)
	index.Upsert(doc2)
	index.Upsert(doc3)
	index.Upsert(doc4)
	index.Upsert(doc5)

	tests := []struct {
		name     string
		selector map[string]string
		expect   []string
	}{
		{
			name:     "empty selector matches everything",
			selector: nil,
			expect:   []string{"1", "2", "3", "4", "5"},
		},
		{
			name: "cabin matches 3,4",
			selector: map[string]string{
				"app": "cabin",
			},
			expect: []string{"3", "4"},
		},
		{
			name: "bindplane matches 1,2",
			selector: map[string]string{
				"app": "bindplane",
			},
			expect: []string{"1", "2"},
		},
		{
			name: "bindplane,production matches 1",
			selector: map[string]string{
				"app": "bindplane",
				"env": "production",
			},
			expect: []string{"1"},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			results := index.Select(test.selector)
			require.ElementsMatch(t, test.expect, results)
		})
	}
}

// ----------------------------------------------------------------------

func prefixSuggestion(label, query string) *Suggestion {
	return &Suggestion{
		Label: label,
		Query: query,
		Score: ScorePrefix,
	}
}

func exactSuggestion(label, query string) *Suggestion {
	return &Suggestion{
		Label: label,
		Query: query,
		Score: ScoreExact,
	}
}
