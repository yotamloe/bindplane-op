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
	"os"
	"path"
	"testing"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func initializeTestFiles(t *testing.T, h Helper) {
	// copy test-profiles into testing path
	profilesFolderPath := h.Folder().ProfilesFolderPath()
	err := h.Folder().(*folder).ensureProfilesFolderExists()
	require.NoError(t, err)

	testProfilesPath := path.Join("testfiles", "test-profiles")
	files, err := ioutil.ReadDir(testProfilesPath)
	require.NoError(t, err)
	for _, file := range files {
		bytes, err := ioutil.ReadFile(path.Join(testProfilesPath, file.Name()))
		require.NoError(t, err)

		err = ioutil.WriteFile(path.Join(profilesFolderPath, file.Name()), bytes, 0600)
		require.NoError(t, err)
	}
}

func cleanupTestFiles(h Helper) {
	os.RemoveAll(h.Folder().ProfilesFolderPath())
	// make sure the folder exists, gross!
	h.Folder().(*folder).ensureProfilesFolderExists()
}

func TestListCommand(t *testing.T) {
	h := newTestHelper()
	initializeTestFiles(t, h)
	defer cleanupTestFiles(h)

	t.Run("returns a cobra command", func(t *testing.T) {
		l := ListCommand(h)
		assert.IsType(t, &cobra.Command{}, l)
	})

	t.Run("prints found profiles", func(t *testing.T) {
		want := "local\n"

		b := bytes.NewBufferString("")

		l := ListCommand(h)
		l.SetOut(b)
		l.Execute()

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Equal(t, want, string(out))
	})

	t.Run("message on no saved profiles", func(t *testing.T) {
		want := "No saved profiles found.\n"
		cleanupTestFiles(h)

		b := bytes.NewBufferString("")

		l := ListCommand(h)
		l.SetOut(b)
		l.Execute()

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Equal(t, want, string(out))
	})
}
