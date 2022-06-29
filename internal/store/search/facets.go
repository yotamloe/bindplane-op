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
	"fmt"
	"strconv"
	"strings"
)

// facets tracks the list and usage of field and label names and values. There is no locking here because it is expected
// that locking is done at the index. The pointer *counter could be a *uint32 but that would make the code harder to
// follow. It is important that a single count be shared between the two maps allowing counts to be easily decremented
// when a document is removed.
type facets struct {
	// names is a map of name to facet. these are all of the possible names in use mapped to the number of times they are
	// used and the possible values that are used with each of them.
	names map[string]*facet

	// ids is a map of document id to the counters impacted by this document. this allows us to decrement the right
	// counters when a document is deleted.
	ids map[string][]*counter
}

func newFacets() *facets {
	return &facets{
		names: map[string]*facet{},
		ids:   map[string][]*counter{},
	}
}

func (n *facets) Upsert(i Indexed) {
	id := i.IndexID()

	// easier to start over
	n.Remove(id)

	indexer := func(name, value string) {
		n.Add(id, name, value)
	}
	i.IndexFields(indexer)
	i.IndexLabels(indexer)
}

func (n *facets) Remove(id string) {
	counters, ok := n.ids[id]
	if !ok {
		// not stored
		return
	}
	// decrement for any names in use
	for _, counter := range counters {
		counter.decrement()
	}
	delete(n.ids, id)
	n.removeZeros()
}

func (n *facets) AllNames() []string {
	results := []string{}
	for _, facet := range n.names {
		results = append(results, facet.name)
	}
	return results
}

// TODO(andy): support more than just prefix matching
func (n *facets) NameSuggestions(operator string, query string) []*Suggestion {
	// match case-insensitive
	query = strings.ToLower(query)
	results := []*Suggestion{}
	for name, facet := range n.names {
		if name == query {
			results = append(results, nameSuggestion(operator, facet.name, ScoreExact))
			continue
		}

		if strings.HasPrefix(name, query) {
			results = append(results, nameSuggestion(operator, facet.name, ScorePrefix))
		}
	}
	return results
}

func (n *facets) ValueSuggestions(operator string, name string, query string) []*Suggestion {
	// match case-insensitive
	query = strings.ToLower(query)

	// find the facet with the specified name
	key := strings.ToLower(name)
	facet, ok := n.names[key]

	// no facet exists, no suggestions
	if !ok {
		return []*Suggestion{}
	}

	// match the facet values
	results := []*Suggestion{}
	for value, facetValue := range facet.values {
		if value == query {
			results = append(results, valueSuggestion(operator, facet.name, facetValue.value, facetValue.query, ScoreExact))
			continue
		}

		if strings.HasPrefix(value, query) {
			results = append(results, valueSuggestion(operator, facet.name, facetValue.value, facetValue.query, ScorePrefix))
		}
	}
	return results
}

func nameSuggestion(operator string, name string, score int) *Suggestion {
	return &Suggestion{
		Label: fmt.Sprintf("%s%s:", operator, name),
		Query: fmt.Sprintf("%s%s:", operator, name),
		Score: score,
	}
}

func valueSuggestion(operator string, name string, value string, query *string, score int) *Suggestion {
	// we don't expect this to happen but it is used in tests and avoids a panic
	if query == nil {
		query = &value
	}
	return &Suggestion{
		Label: value,
		Query: fmt.Sprintf("%s%s:%s", operator, name, *query),
		Score: score,
	}
}

func (n *facets) AllValues(name string) []string {
	key := strings.ToLower(name)
	facet, ok := n.names[key]
	if !ok || facet.counter.isZero() {
		return []string{}
	}
	return facet.AllValues()
}

// Size returns the number of unique name/value pairs stored in the facets
func (n *facets) Size() int {
	result := 0
	for _, facet := range n.names {
		result += facet.Size()
	}
	return result
}

// Add adds a name/value pair for the specified id, appending to the list of counters corresponding to the
// name and value. If a name is duplicated in separate calls to this function, the same counter may appear in the list
// of counters multiple times. This is ok because it will be incremented and decremented an equal number of times when
// the document is inserted and removed.
func (n *facets) Add(id, name, value string) {
	if value == "" {
		return
	}
	// increment the name
	facet := n.ensureFacet(name)
	facet.counter.increment()
	n.addCounter(id, facet.counter)

	// increment the value
	facetValue := facet.ensureValue(value)
	facetValue.counter.increment()
	n.addCounter(id, facetValue.counter)
}

func (n *facets) addCounter(id string, c *counter) {
	counters, ok := n.ids[id]
	if !ok {
		counters = []*counter{}
	}
	counters = append(counters, c)
	n.ids[id] = counters
}

// ensureFacet returns the name associated with the specified name or creates a new name, stores it, and returns it.
func (n *facets) ensureFacet(name string) *facet {
	key := strings.ToLower(name)
	facet, ok := n.names[key]
	if !ok {
		facet = newFacet(name)
		n.names[key] = facet
	}
	return facet
}

// removeZeros iterates over the list removing any counter with zero indicating that they are no longer used.
func (n *facets) removeZeros() {
	for name, facet := range n.names {
		facet.removeZeros()
		if facet.counter.isZero() {
			// no longer used, cleanup
			delete(n.names, name)
		}
	}
}

// facet holds a counter to the number of times this facet name is used and each of the possible values for the facet
// and their counters
type facet struct {
	name    string
	counter *counter
	values  map[string]*facetValue
}

func newFacet(name string) *facet {
	return &facet{
		name:    name,
		counter: newCounter(),
		values:  map[string]*facetValue{},
	}
}

func (n *facet) AllValues() []string {
	results := []string{}
	for _, facetValue := range n.values {
		results = append(results, facetValue.value)
	}
	return results
}

func (n *facet) Size() int {
	return len(n.values)
}

func (n *facet) ensureValue(value string) *facetValue {
	key := strings.ToLower(value)
	entry, ok := n.values[key]
	if !ok {
		entry = newFacetValue(value)
		n.values[key] = entry
	}
	return entry
}

// removeZeros iterates over the list removing any counter with zero indicating that they are no longer used.
func (n *facet) removeZeros() {
	for value, facetValue := range n.values {
		if facetValue.counter.isZero() {
			// no longer used, cleanup
			delete(n.values, value)
		}
	}
}

type facetValue struct {
	value string
	// query is the text that appears in a value query. generally it is the same as value so we use a pointer to save
	// space and just point to that value instead of keeping two copies of the same string.
	query   *string
	counter *counter
}

func newFacetValue(value string) *facetValue {
	// generally query is the same as value
	query := &value
	if strings.Contains(value, " ") {
		// if value contains spaces, query is quoted
		quoted := strconv.Quote(value)
		query = &quoted
	}
	return &facetValue{
		value:   value,
		query:   query,
		counter: newCounter(),
	}
}

// counter is a simple count of the number of times a name or value is used. increase when we expect more than 4 billion
// entries.
type counter uint32

func newCounter() *counter {
	var c counter
	return &c
}

func (c *counter) increment() {
	*c++
}

func (c *counter) decrement() {
	*c--
}

func (c *counter) isZero() bool {
	return *c == 0
}
