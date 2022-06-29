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

func TestDeleteCommand(t *testing.T) {
	h := newTestHelper()

	t.Run("returns a cobra command", func(t *testing.T) {
		d := DeleteCommand(h)
		assert.IsType(t, &cobra.Command{}, d)
	})

	t.Run("requires name argument", func(t *testing.T) {
		d := DeleteCommand(h)
		err := d.Execute()
		assert.Error(t, err)
	})

	t.Run("deletes a profile resource", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		d := DeleteCommand(h)
		d.SetArgs([]string{"local"})

		d.Execute()

		names := h.Folder().ProfileNames()
		assert.Equal(t, []string{}, names)
	})

	t.Run("message when no profile present", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		d := DeleteCommand(h)
		d.SetArgs([]string{
			"does-not-exist",
		})
		b := bytes.NewBufferString("")
		d.SetOut(b)
		d.SetErr(b)

		d.Execute()

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Contains(t, string(out), "does-not-exist.yaml: no such file or directory\n")
	})

	t.Run("returns error when write fails", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		os.Chmod(h.Folder().ProfilesFolderPath(), fs.FileMode(os.O_RDONLY))
		defer func() {
			os.Chmod(h.Folder().ProfilesFolderPath(), 0750)
		}()

		d := DeleteCommand(h)
		d.SetArgs([]string{"local"})

		err := d.Execute()
		assert.Error(t, err)
	})
}
