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

func TestParseDestination(t *testing.T) {
	resources, err := ResourcesFromFile("testfiles/destination-cabin.yaml")
	require.NoError(t, err)

	parsed, err := ParseResources(resources)
	require.Len(t, parsed, 1)

	dt, ok := parsed[0].(*Destination)
	require.True(t, ok)
	require.Equal(t, dt.Name(), "cabin-production-logs")
	require.Equal(t, dt.Spec.Type, "observiq-cloud")
	require.Equal(t, dt.Spec.Parameters[0].Name, "endpoint")
	require.Equal(t, dt.Spec.Parameters[0].Value, "https://nozzle.app.observiq.com")
}
