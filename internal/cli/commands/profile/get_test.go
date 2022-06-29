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

var profileYaml = `apiVersion: bindplane.observiq.com/v1beta
kind: Profile
metadata:
  name: local
spec:
  host: 192.168.64.1
  port: "5000"
  serverURL: https://remote-address.com
  username: admin
  password: admin
  tlsCert: tls/bindplane.crt
  tlsKey: tls/bindplane.key
  tlsCa:
  - tls/bindplane-authority
  - tls/bindplane-authority2
`

func TestGetCommand(t *testing.T) {
	h := newTestHelper()

	t.Run("returns cobra command", func(t *testing.T) {
		g := GetCommand(h)
		assert.IsType(t, &cobra.Command{}, g)
	})

	t.Run("returns current profile with no name argument", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		c := GetCommand(h)

		b := bytes.NewBufferString("")
		c.SetOut(b)

		err := c.Execute()
		require.NoError(t, err)

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Equal(t, profileYaml, string(out))
	})

	t.Run("gets the right profile", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		g := GetCommand(h)

		b := bytes.NewBufferString("")
		g.SetOut(b)

		g.SetArgs([]string{"local"})
		g.Execute()

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Equal(t, profileYaml, string(out))
	})

	t.Run("error when cant find the profile", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		g := GetCommand(h)

		b := bytes.NewBufferString("")
		g.SetOut(b)

		g.SetArgs([]string{"does-not-exist"})
		err := g.Execute()

		assert.Error(t, err)
	})

	t.Run("returns the current context spec when flag is passed", func(t *testing.T) {
		initializeTestFiles(t, h)
		defer cleanupTestFiles(h)

		b := bytes.NewBufferString("")

		g := GetCommand(h)
		g.SetOut(b)

		g.SetArgs([]string{"--current"})
		err := g.Execute()
		assert.NoError(t, err)

		out, err := ioutil.ReadAll(b)
		require.NoError(t, err, "error while attempting to read byte array")

		assert.Equal(t, profileYaml, string(out))
	})

	t.Run("Error message when there are no saved profiles", func(t *testing.T) {
		cleanupTestFiles(h)

		g := GetCommand(h)

		g.SetArgs([]string{"local"})
		err := g.Execute()
		assert.Error(t, err)
	})
}
