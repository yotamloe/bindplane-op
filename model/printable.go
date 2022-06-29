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

package model

// Printable is implemented for resources so that they can be printed by the CLI.
type Printable interface {
	// PrintableKindSingular returns the singular form of the Kind, e.g. "Configuration"
	PrintableKindSingular() string

	// PrintableKindPlural returns the plural form of the Kind, e.g. "Configurations"
	PrintableKindPlural() string

	// PrintableFieldTitles returns the list of field titles, used for printing a table of resources
	PrintableFieldTitles() []string

	// PrintableFieldValue returns the field value for a title, used for printing a table of resources
	PrintableFieldValue(title string) string
}

// PrintableFieldValues uses PrintableFieldTitles and PrintableFieldValue of the specified Printable to assemble the list
// of values to print
func PrintableFieldValues(p Printable) []string {
	titles := p.PrintableFieldTitles()
	return PrintableFieldValuesForTitles(p, titles)
}

// PrintableFieldValuesForTitles uses PrintableFieldValue of the specified Printable to assemble the list
// of values to print for the specified titles
func PrintableFieldValuesForTitles(p Printable, titles []string) []string {
	values := make([]string, len(titles))
	for i, title := range titles {
		values[i] = p.PrintableFieldValue(title)
	}
	return values
}
