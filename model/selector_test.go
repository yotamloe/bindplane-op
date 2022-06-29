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

import (
	"testing"

	"github.com/stretchr/testify/require"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/apimachinery/pkg/selection"
)

func testSelectorFromMap(t *testing.T, m map[string]string) Selector {
	s, err := SelectorFromMap(m)
	require.NoError(t, err)
	return s
}

func testSelectorFromString(t *testing.T, selector string) Selector {
	s, err := SelectorFromString(selector)
	require.NoError(t, err)
	return s
}

func TestMatchLabels(t *testing.T) {
	r1, err := labels.NewRequirement("x", selection.Equals, []string{"y"})
	require.NoError(t, err)
	r2, err := labels.NewRequirement("a", selection.DoubleEquals, []string{"b"})
	require.NoError(t, err)
	r3, err := labels.NewRequirement("c", selection.NotEquals, []string{"d"})
	require.NoError(t, err)

	s := labels.NewSelector()
	s = s.Add(*r1, *r2, *r3)

	tests := []struct {
		name           string
		selector       Selector
		expectLabels   map[string]string
		expectComplete bool
	}{
		{
			name:           "nothing selector returns nil labels, complete=false",
			selector:       EmptySelector(),
			expectComplete: false,
		},
		{
			name:           "everything selector returns empty labels, complete=true",
			selector:       EverythingSelector(),
			expectComplete: true,
			expectLabels:   map[string]string{},
		},
		{
			name:           "empty string selector returns empty labels, complete=true",
			selector:       testSelectorFromString(t, ""),
			expectComplete: true,
			expectLabels:   map[string]string{},
		},
		{
			name:           "nil map selector returns empty labels, complete=true",
			selector:       testSelectorFromMap(t, nil),
			expectComplete: true,
			expectLabels:   map[string]string{},
		},
		{
			name:           "single label match",
			selector:       testSelectorFromString(t, "x=y"),
			expectComplete: true,
			expectLabels: map[string]string{
				"x": "y",
			},
		},
		{
			name:           "multi label match",
			selector:       testSelectorFromString(t, "x=y,a=b"),
			expectComplete: true,
			expectLabels: map[string]string{
				"x": "y",
				"a": "b",
			},
		},
		{
			name:           "complex selector, partial results",
			selector:       Selector{s},
			expectComplete: false,
			expectLabels: map[string]string{
				"x": "y",
				"a": "b",
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			labels, complete := test.selector.MatchLabels()
			require.Equal(t, test.expectComplete, complete)
			require.Equal(t, MatchLabels(test.expectLabels), labels)
		})
	}
}
