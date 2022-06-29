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

// ----------------------------------------------------------------------
// convenience for testing

var _ Indexed = (*document)(nil)

func (d *document) IndexID() string { return d.id }

func (d *document) IndexFields(index Indexer) {
	for n, v := range d.fields {
		v.each(func(sv string) {
			index(n, sv)
		})
	}
}

func (d *document) IndexLabels(index Indexer) {
	for n, v := range d.labels {
		index(n, v)
	}
}

// ----------------------------------------------------------------------

func TestFacetsEmpty(t *testing.T) {
	f := newFacets()
	require.Equal(t, 0, f.Size())
	require.Equal(t, counter(0), f.totalCount())
	require.ElementsMatch(t, []string{}, f.AllNames())
	require.ElementsMatch(t, []string{}, f.AllValues("any"))
}

func TestFacetsSingleTerm(t *testing.T) {
	f := newFacets()
	doc := emptyDocument("A")
	doc.labels["x"] = "y"
	f.Upsert(doc)
	require.Equal(t, 1, f.Size())
	require.Equal(t, counter(2), f.totalCount())
	require.ElementsMatch(t, []string{"x"}, f.AllNames())
	require.ElementsMatch(t, []string{"y"}, f.AllValues("x"))
}

func TestFacetsRemoveSingleTerm(t *testing.T) {
	f := newFacets()
	doc := emptyDocument("A")
	doc.labels["x"] = "y"
	f.Upsert(doc)
	f.Remove(doc.id)
	require.Equal(t, 0, f.Size())
	require.Equal(t, counter(0), f.totalCount())
	require.ElementsMatch(t, []string{}, f.AllNames())
	require.ElementsMatch(t, []string{}, f.AllValues("x"))
}

func TestFacetsPrefixMatch(t *testing.T) {
	f := newFacets()

	doc1 := emptyDocument("1")
	doc1.labels["apple"] = "one"
	doc1.labels["Another"] = "one"
	doc1.labels["different"] = "one"
	doc1.labels["empty"] = "" // will be ignored

	doc2 := emptyDocument("2")
	doc2.labels["Apple"] = "two"

	doc3 := emptyDocument("3")
	doc3.labels["apple"] = "three"
	doc3.labels["Another"] = "one"
	doc3.labels["different"] = "one"

	f.Upsert(doc1)
	f.Upsert(doc2)
	f.Upsert(doc3)

	require.Equal(t, 5, f.Size())
	require.Equal(t, counter(3), *f.names["apple"].counter)
	require.Equal(t, counter(1), *f.names["apple"].values["one"].counter)
	require.Equal(t, counter(1), *f.names["apple"].values["two"].counter)
	require.Equal(t, counter(1), *f.names["apple"].values["three"].counter)
	require.Equal(t, counter(2), *f.names["another"].counter)
	require.Equal(t, counter(2), *f.names["another"].values["one"].counter)
	require.Equal(t, counter(2), *f.names["different"].counter)
	require.Equal(t, counter(2), *f.names["different"].values["one"].counter)
	require.Equal(t, counter(14), f.totalCount())

	require.ElementsMatch(t, []string{"apple", "Another", "different"}, f.AllNames())
	require.ElementsMatch(t, []string{"one", "two", "three"}, f.AllValues("APPLE"))
	require.ElementsMatch(t, []string{"one"}, f.AllValues("another"))

	nameSuggestions := f.NameSuggestions("", "a")
	require.Equal(t, 2, len(nameSuggestions))
	// while matching is case-insensitive, we expect the original case (or the first one used if multiple) to be returned
	require.ElementsMatch(t, []*Suggestion{ns("apple", ScorePrefix), ns("Another", ScorePrefix)}, nameSuggestions)

	nameSuggestionsExact := f.NameSuggestions("", "apple")
	require.ElementsMatch(t, []*Suggestion{ns("apple", ScoreExact)}, nameSuggestionsExact)

	appleAllSuggestions := f.ValueSuggestions("", "apple", "")
	require.Equal(t, 3, len(appleAllSuggestions))
	require.ElementsMatch(t, []*Suggestion{
		vs("apple", "one", ScorePrefix),
		vs("apple", "two", ScorePrefix),
		vs("apple", "three", ScorePrefix),
	}, appleAllSuggestions)

	applePrefixSuggestions := f.ValueSuggestions("", "apple", "t")
	require.Equal(t, 2, len(applePrefixSuggestions))
	require.ElementsMatch(t, []*Suggestion{
		vs("apple", "two", ScorePrefix),
		vs("apple", "three", ScorePrefix),
	}, applePrefixSuggestions)

	// now remove a document and test everything again
	f.Remove("3")

	require.Equal(t, 4, f.Size())
	require.Equal(t, counter(2), *f.names["apple"].counter)
	require.Equal(t, counter(1), *f.names["apple"].values["one"].counter)
	require.Equal(t, counter(1), *f.names["apple"].values["two"].counter)
	require.Equal(t, counter(1), *f.names["another"].counter)
	require.Equal(t, counter(1), *f.names["another"].values["one"].counter)
	require.Equal(t, counter(1), *f.names["different"].counter)
	require.Equal(t, counter(1), *f.names["different"].values["one"].counter)
	require.Equal(t, counter(8), f.totalCount())

	require.ElementsMatch(t, []string{"apple", "Another", "different"}, f.AllNames())
	require.ElementsMatch(t, []string{"one", "two"}, f.AllValues("APPLE"))
	require.ElementsMatch(t, []string{"one"}, f.AllValues("another"))

	nameSuggestions2 := f.NameSuggestions("", "a")
	require.Equal(t, 2, len(nameSuggestions2))
	// while matching is case-insensitive, we expect the original case (or the first one used if multiple) to be returned
	require.ElementsMatch(t, []*Suggestion{ns("apple", ScorePrefix), ns("Another", ScorePrefix)}, nameSuggestions2)

	appleAllSuggestions2 := f.ValueSuggestions("", "apple", "")
	require.Equal(t, 2, len(appleAllSuggestions2))
	require.ElementsMatch(t, []*Suggestion{
		vs("apple", "one", ScorePrefix),
		vs("apple", "two", ScorePrefix),
	}, appleAllSuggestions2)

	applePrefixSuggestions2 := f.ValueSuggestions("", "apple", "t")
	require.Equal(t, 1, len(applePrefixSuggestions2))
	require.ElementsMatch(t, []*Suggestion{
		vs("apple", "two", ScorePrefix),
	}, applePrefixSuggestions2)

	// now remove another document and test again
	f.Remove("2")

	require.Equal(t, 3, f.Size())
	require.Equal(t, counter(1), *f.names["apple"].counter)
	require.Equal(t, counter(1), *f.names["apple"].values["one"].counter)
	require.Equal(t, counter(1), *f.names["another"].counter)
	require.Equal(t, counter(1), *f.names["another"].values["one"].counter)
	require.Equal(t, counter(1), *f.names["different"].counter)
	require.Equal(t, counter(1), *f.names["different"].values["one"].counter)
	require.Equal(t, counter(6), f.totalCount())

	require.ElementsMatch(t, []string{"apple", "Another", "different"}, f.AllNames())
	require.ElementsMatch(t, []string{"one"}, f.AllValues("APPLE"))
	require.ElementsMatch(t, []string{"one"}, f.AllValues("another"))

	nameSuggestions3 := f.NameSuggestions("", "a")
	require.Equal(t, 2, len(nameSuggestions3))
	// while matching is case-insensitive, we expect the original case (or the first one used if multiple) to be returned
	require.ElementsMatch(t, []*Suggestion{ns("apple", ScorePrefix), ns("Another", ScorePrefix)}, nameSuggestions3)

	appleAllSuggestions3 := f.ValueSuggestions("", "apple", "")
	require.Equal(t, 1, len(appleAllSuggestions3))
	require.ElementsMatch(t, []*Suggestion{
		vs("apple", "one", ScorePrefix),
	}, appleAllSuggestions3)

	applePrefixSuggestions3 := f.ValueSuggestions("", "apple", "t")
	require.Equal(t, 0, len(applePrefixSuggestions3))
	require.ElementsMatch(t, []*Suggestion{}, applePrefixSuggestions3)

	// remove the final document
	f.Remove("1")
	require.Equal(t, 0, f.Size())
	require.Equal(t, counter(0), f.totalCount())
	require.ElementsMatch(t, []string{}, f.AllNames())
	require.ElementsMatch(t, []string{}, f.AllValues("APPLE"))
	require.ElementsMatch(t, []string{}, f.AllValues("another"))

	nameSuggestions4 := f.NameSuggestions("", "a")
	require.Equal(t, 0, len(nameSuggestions4))
	appleAllSuggestions4 := f.ValueSuggestions("", "apple", "")
	require.Equal(t, 0, len(appleAllSuggestions4))
	applePrefixSuggestions4 := f.ValueSuggestions("", "apple", "t")
	require.Equal(t, 0, len(applePrefixSuggestions4))
}

func TestFacetsWithSpaces(t *testing.T) {
	f := newFacets()

	doc1 := emptyDocument("1")
	doc1.labels["apple"] = "two words"

	f.Upsert(doc1)

	suggestions := f.ValueSuggestions("", "apple", "")
	require.Equal(t, 1, len(suggestions))
	require.ElementsMatch(t, []*Suggestion{
		{
			Label: "two words",
			Query: `apple:"two words"`,
			Score: ScorePrefix,
		},
	}, suggestions)
}

func TestFacetsWithOperators(t *testing.T) {
	tests := []struct {
		queryToken string
		expect     []*Suggestion
	}{
		{
			queryToken: "-apple:t",
			expect: []*Suggestion{
				{
					Label: "two",
					Query: `-apple:two`,
					Score: ScorePrefix,
				},
				{
					Label: "two words",
					Query: `-apple:"two words"`,
					Score: ScorePrefix,
				},
			},
		},
		{
			queryToken: "+apple:t",
			expect: []*Suggestion{
				{
					Label: "two",
					Query: `+apple:two`,
					Score: ScorePrefix,
				},
				{
					Label: "two words",
					Query: `+apple:"two words"`,
					Score: ScorePrefix,
				},
			},
		},
		{
			queryToken: "apple:t",
			expect: []*Suggestion{
				{
					Label: "two",
					Query: `apple:two`,
					Score: ScorePrefix,
				},
				{
					Label: "two words",
					Query: `apple:"two words"`,
					Score: ScorePrefix,
				},
			},
		},
	}

	f := newFacets()
	doc1 := emptyDocument("1")
	doc1.labels["apple"] = "two words"
	doc2 := emptyDocument("2")
	doc2.labels["apple"] = "two"
	f.Upsert(doc1)
	f.Upsert(doc2)

	for _, test := range tests {
		t.Run(test.queryToken, func(t *testing.T) {
			token := parseToken(test.queryToken)
			suggestions := f.ValueSuggestions(token.Operator, token.Name, token.Value)
			require.ElementsMatch(t, test.expect, suggestions)
		})
	}
}

// ----------------------------------------------------------------------

func ns(name string, score int) *Suggestion {
	return nameSuggestion("", name, score)
}

func vs(name string, value string, score int) *Suggestion {
	return valueSuggestion("", name, value, nil, score)
}

// totalCount returns the sum of all counters. useful for tests.
func (n *facets) totalCount() counter {
	var result counter
	for _, facet := range n.names {
		result += facet.totalCount()
	}
	return result
}

// totalCount returns the sum of all counters. useful for tests.
func (n *facet) totalCount() counter {
	var result counter
	for _, fv := range n.values {
		result += *fv.counter
	}
	result += *n.counter
	return result
}
