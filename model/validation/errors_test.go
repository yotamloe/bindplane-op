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

package validation

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestErrors(t *testing.T) {
	tests := []struct {
		name   string
		errors []string
		expect string
	}{
		{
			name:   "nil errors",
			errors: nil,
			expect: "",
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			list := NewErrors()
			for _, e := range test.errors {
				list.Add(errors.New(e))
			}
			err := list.Result()
			if err != nil {
				require.Equal(t, test.expect, err.Error())
			} else {
				require.Equal(t, test.expect, "")
			}
		})
	}
}
