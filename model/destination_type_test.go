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
)

func TestParseDestinationType(t *testing.T) {
	resources, err := ResourcesFromFile("testfiles/destinationtype-cabin.yaml")
	require.NoError(t, err)

	parsed, err := ParseResources(resources)
	require.NoError(t, err)
	require.Len(t, parsed, 1)

	dt, ok := parsed[0].(*DestinationType)
	require.True(t, ok)
	require.Equal(t, "observiq-cloud", dt.Name())
	require.Equal(t, len(dt.Spec.Logs.Receivers), 0)
	require.Greater(t, len(dt.Spec.Logs.Processors), 0)
	require.Greater(t, len(dt.Spec.Logs.Exporters), 0)
	require.Equal(t, len(dt.Spec.Logs.Extensions), 0)
}
