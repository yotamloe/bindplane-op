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

package profile

import (
	"bytes"
	"io/ioutil"
	"testing"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCurrentCommand(t *testing.T) {
	h := newTestHelper()
	t.Run("returns a cobra command", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)
		c := CurrentCommand(h)
		assert.IsType(t, &cobra.Command{}, c)
	})

	t.Run("prints the saved context", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)
		c := CurrentCommand(h)

		b := bytes.NewBufferString("")
		c.SetOut(b)

		c.Execute()

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Equal(t, "local\n", string(out))
	})

	t.Run("no saved context output", func(t *testing.T) {
		cleanupTestFiles(h)

		c := CurrentCommand(h)

		b := bytes.NewBufferString("")
		c.SetOut(b)

		c.Execute()

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Equal(t, "no saved profile specified\n", string(out))
	})
}
