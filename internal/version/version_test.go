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

package version

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestString(t *testing.T) {
	cases := []struct {
		name    string
		version Version
		expect  string
	}{
		{
			"commit",
			Version{
				Commit: "a0486ebd9f33a2b110ecb7d08e863c37413b9894",
			},
			"a0486ebd9f33a2b110ecb7d08e863c37413b9894",
		},
		{
			"tag",
			Version{
				Tag: "v5.0.1",
			},
			"v5.0.1",
		},
		{
			"both",
			Version{
				Commit: "a0486ebd9f33a2b110ecb7d08e863c37413b9894",
				Tag:    "v5.0.1",
			},
			"v5.0.1",
		},
		{
			"unknown",
			Version{},
			"unknown",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			output := tc.version.String()
			require.Equal(t, tc.expect, output)
		})
	}
}

func TestNewVersion(t *testing.T) {
	cases := []struct {
		name   string
		commit string
		tag    string
		expect Version
	}{
		{
			"commit",
			"a0486ebd9f33a2b110ecb7d08e863c37413b9894",
			"",
			Version{
				Commit: "a0486ebd9f33a2b110ecb7d08e863c37413b9894",
			},
		},
		{
			"tag",
			"",
			"v2.5.0",
			Version{
				Tag: "v2.5.0",
			},
		},
		{
			"both",
			"a0486ebd9f33a2b110ecb7d08e863c37413b9894",
			"v2.5.0",
			Version{
				Commit: "a0486ebd9f33a2b110ecb7d08e863c37413b9894",
				Tag:    "v2.5.0",
			},
		},
		{
			"empty",
			"",
			"",
			Version{},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			// set package globals, usually set with ldflags at compile time
			gitCommit = tc.commit
			gitTag = tc.tag
			defer func() {
				gitCommit = ""
				gitTag = ""
			}()

			output := NewVersion()
			require.Equal(t, tc.expect.Commit, output.Commit)
			require.Equal(t, tc.expect.Tag, output.Tag)
		})
	}
}
