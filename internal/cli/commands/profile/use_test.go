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
	"io/fs"
	"io/ioutil"
	"os"
	"testing"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUseCommand(t *testing.T) {
	t.Run("returns a cobra command", func(t *testing.T) {
		h := newTestHelper()
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		u := UseCommand(h)
		assert.NotNil(t, u)
		assert.IsType(t, &cobra.Command{}, u)
	})

	t.Run("error on missing argument <name>", func(t *testing.T) {
		h := newTestHelper()
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		u := UseCommand(h)

		err := u.Execute()
		assert.Error(t, err)
	})

	t.Run("returns error when writeConfigFile fails", func(t *testing.T) {
		h := newTestHelper()
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		u := UseCommand(h)
		u.SetArgs([]string{"local"})

		os.Chmod(h.Folder().ProfilesFolderPath(), fs.FileMode(os.O_RDONLY))
		defer func() {
			os.Chmod(h.Folder().ProfilesFolderPath(), 0750)
		}()

		err := u.Execute()
		assert.Error(t, err)
	})

	t.Run("sets the currentContext on the Context.Spec", func(t *testing.T) {
		h := newTestHelper()
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		u := UseCommand(h)
		u.SetArgs([]string{"new"})

		u.Execute()

		current, err := h.Folder().CurrentProfileName()
		require.NoError(t, err)

		assert.Equal(t, "local", current)
	})

	t.Run("prints an error if context is set to a non existent profile", func(t *testing.T) {
		h := newTestHelper()
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		u := UseCommand(h)
		u.SetArgs([]string{"new"})

		b := bytes.NewBufferString("")
		u.SetOut(b)
		u.SetErr(b)

		u.Execute()

		current, err := h.Folder().CurrentProfileName()
		require.NoError(t, err)

		assert.Equal(t, "local", current)

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Contains(t, string(out), "no profile found with name 'new'")
	})

	t.Run("no warning message when switching to existing profile", func(t *testing.T) {
		h := newTestHelper()
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		u := UseCommand(h)
		u.SetArgs([]string{"local"})

		b := bytes.NewBufferString("")
		u.SetOut(b)

		u.Execute()

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.NotContains(t, string(out), "Warning: no profile found with name 'local'")
	})
}
