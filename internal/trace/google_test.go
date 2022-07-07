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

package trace

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNewGoogleCloudExporter(t *testing.T) {
	cases := []struct {
		name   string
		config GoogleCloudTracing
		errStr string
	}{
		{
			"empty",
			GoogleCloudTracing{},
			"no project found with application default credentials",
		},
		{
			"valid",
			GoogleCloudTracing{
				ProjectID: "test",
			},
			"",
		},
		{
			"invalid-file-path",
			GoogleCloudTracing{
				ProjectID:       "test",
				CredentialsFile: "bad/path",
			},
			"cannot read credentials file: open bad/path: no such file or directory",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			out, err := NewGoogleCloudExporter(context.Background(), tc.config, nil)

			if tc.errStr != "" {
				require.Error(t, err)
				require.Contains(t, err.Error(), tc.errStr)
				return
			}

			require.NoError(t, err)
			require.NotNil(t, out)
		})
	}
}
