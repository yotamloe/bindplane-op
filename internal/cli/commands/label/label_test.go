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

package label

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSplitArgs(t *testing.T) {
	tests := []struct {
		name      string
		args      []string
		resources []string
		changes   []*labelChange
		err       bool
	}{
		{
			name:      "no args",
			args:      []string{},
			resources: []string{},
			changes:   []*labelChange{},
			err:       false,
		},
		{
			name:      "2 resources",
			args:      []string{"A", "B"},
			resources: []string{"A", "B"},
			changes:   []*labelChange{},
			err:       false,
		},
		{
			name:      "2 labels",
			args:      []string{"x=y", "z-"},
			resources: []string{},
			changes: []*labelChange{
				{name: "x", value: "y"},
				{name: "z", value: ""},
			},
			err: false,
		},
		{
			name:      "2 resources, 2 labels",
			args:      []string{"A", "B", "x=y", "z-"},
			resources: []string{"A", "B"},
			changes: []*labelChange{
				{name: "x", value: "y"},
				{name: "z", value: ""},
			},
			err: false,
		},
		{
			name:      "resource after labels",
			args:      []string{"A", "x=y", "z-", "B"},
			resources: nil,
			changes:   nil,
			err:       true,
		},
		{
			name:      "two equals becomes a resource",
			args:      []string{"A=B=C", "x=y", "z-"},
			resources: []string{"A=B=C"},
			changes: []*labelChange{
				{name: "x", value: "y"},
				{name: "z", value: ""},
			},
			err: false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			resources, changes, err := splitArgs(test.args)
			require.ElementsMatch(t, resources, test.resources)
			require.ElementsMatch(t, changes, test.changes)
			require.Equal(t, test.err, err != nil)
		})
	}
}
