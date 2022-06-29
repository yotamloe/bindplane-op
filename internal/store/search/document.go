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
	"strings"

	"golang.org/x/exp/slices"
)

type document struct {
	id     string
	fields map[string]fieldValue
	labels map[string]string

	// values is a collection of the lowercase form of all field values, label names, and label values, separated by
	// newlines for use with general text search
	values string
}

func emptyDocument(id string) *document {
	return &document{
		id:     id,
		fields: map[string]fieldValue{},
		labels: map[string]string{},
		values: "",
	}
}

func newDocument(indexed Indexed) *document {
	id := indexed.IndexID()
	doc := emptyDocument(id)
	indexed.IndexFields(func(name, value string) {
		name = strings.ToLower(name)
		value = strings.ToLower(value)
		doc.addField(name, value)
	})
	indexed.IndexLabels(func(name, value string) {
		name = strings.ToLower(name)
		value = strings.ToLower(value)
		doc.labels[name] = value
	})
	doc.values = doc.buildValues()

	return doc
}

func (d *document) buildValues() string {
	// WriteString and WriteRune will return nil errors, so we ignore them
	var sb strings.Builder
	for _, v := range d.fields {
		v.each(func(sv string) {
			_, _ = sb.WriteString(sv)
			_, _ = sb.WriteRune('\n')
		})
	}
	for n, v := range d.labels {
		_, _ = sb.WriteString(n)
		_, _ = sb.WriteRune('\n')
		_, _ = sb.WriteString(v)
		_, _ = sb.WriteRune('\n')
	}
	return sb.String()
}

func (d *document) addField(name, value string) {
	if value == "" {
		return
	}
	f, ok := d.fields[name]
	if ok {
		d.fields[name] = f.add(value)
	} else {
		d.fields[name] = fieldSingleValue(value)
	}
}

// ----------------------------------------------------------------------
//
// fieldValue allows us to avoid always storing a []string when we generally have a single value.

type fieldValue interface {
	add(value string) fieldValue
	each(func(string))
	contains(value string) bool
}

type fieldSingleValue string
type fieldMultiValue []string

func (f fieldSingleValue) add(value string) fieldValue {
	return fieldMultiValue{string(f), value}
}
func (f fieldSingleValue) each(callback func(value string)) {
	callback(string(f))
}
func (f fieldSingleValue) contains(value string) bool {
	return string(f) == value
}

func (f fieldMultiValue) add(value string) fieldValue {
	return append(f, value)
}
func (f fieldMultiValue) each(callback func(value string)) {
	for _, v := range f {
		callback(v)
	}
}
func (f fieldMultiValue) contains(value string) bool {
	return slices.Contains(f, value)
}
