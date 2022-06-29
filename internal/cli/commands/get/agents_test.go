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

package get

import (
	"bytes"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAgentsCommand(t *testing.T) {
	t.Run("can print multiple agents as a table", func(t *testing.T) {
		buffer := bytes.NewBufferString("")
		bindplane := setupBindPlane(buffer)
		bindplane.Config.Output = tableOutput

		cmd := AgentsCommand(bindplane)
		cmd.SetOut(buffer)
		expected := "ID\tNAME   \tVERSION\tSTATUS      \tCONNECTED\tDISCONNECTED\tLABELS \n1 \tAgent 1\t1.0.0  \tConnected   \t-        \t-           \t      \t\n2 \tAgent 2\t1.0.0  \tDisconnected\t-        \t-           \t      \t\n"

		executeAndAssertOutput(t, cmd, buffer, expected)
	})

	t.Run("can print multiple agents as JSON", func(t *testing.T) {
		buffer := bytes.NewBufferString("")
		bindplane := setupBindPlane(buffer)
		bindplane.Config.Output = jsonOutput

		cmd := AgentsCommand(bindplane)
		cmd.SetOut(buffer)
		expected := `[
  {
    "id": "1",
    "name": "Agent 1",
    "type": "stanza",
    "arch": "amd64",
    "hostname": "local",
    "labels": {},
    "version": "1.0.0",
    "home": "/stanza",
    "platform": "linux",
    "operatingSystem": "Ubuntu 20.10",
    "macAddress": "00:00:ac:00:00:00",
    "status": 1
  },
  {
    "id": "2",
    "name": "Agent 2",
    "type": "",
    "arch": "",
    "hostname": "",
    "labels": {},
    "version": "1.0.0",
    "home": "",
    "platform": "",
    "operatingSystem": "",
    "macAddress": "",
    "status": 0
  }
]`

		executeAndAssertOutput(t, cmd, buffer, expected)
	})

	t.Run("can print multiple agents as YAML", func(t *testing.T) {
		buffer := bytes.NewBufferString("")
		bindplane := setupBindPlane(buffer)
		bindplane.Config.Output = yamlOutput

		cmd := AgentsCommand(bindplane)
		cmd.SetOut(buffer)
		expected := `---
id: "1"
name: Agent 1
type: stanza
arch: amd64
hostname: local
labels: {}
version: 1.0.0
home: /stanza
platform: linux
operatingSystem: Ubuntu 20.10
macAddress: 00:00:ac:00:00:00
status: 1
---
id: "2"
name: Agent 2
type: ""
arch: ""
hostname: ""
labels: {}
version: 1.0.0
home: ""
platform: ""
operatingSystem: ""
macAddress: ""
status: 0
`

		executeAndAssertOutput(t, cmd, buffer, expected)
	})

	t.Run("can print a single agent in a table", func(t *testing.T) {
		buffer := bytes.NewBufferString("")
		bindplane := setupBindPlane(buffer)
		bindplane.Config.Output = tableOutput

		cmd := AgentsCommand(bindplane)
		cmd.SetArgs([]string{"1"})
		cmd.SetOut(buffer)
		expected := "ID\tNAME   \tVERSION\tSTATUS   \tCONNECTED\tDISCONNECTED\tLABELS \n1 \tAgent 1\t1.0.0  \tConnected\t-        \t-           \t      \t\n"

		executeAndAssertOutput(t, cmd, buffer, expected)
	})

	t.Run("can print a single agent as JSON", func(t *testing.T) {
		buffer := bytes.NewBufferString("")
		bindplane := setupBindPlane(buffer)
		bindplane.Config.Output = jsonOutput

		cmd := AgentsCommand(bindplane)
		cmd.SetArgs([]string{"1"})
		cmd.SetOut(buffer)
		expected := `{
  "id": "1",
  "name": "Agent 1",
  "type": "stanza",
  "arch": "amd64",
  "hostname": "local",
  "labels": {},
  "version": "1.0.0",
  "home": "/stanza",
  "platform": "linux",
  "operatingSystem": "Ubuntu 20.10",
  "macAddress": "00:00:ac:00:00:00",
  "status": 1
}`

		executeAndAssertOutput(t, cmd, buffer, expected)
	})

	t.Run("can print a single agent as YAML", func(t *testing.T) {
		buffer := bytes.NewBufferString("")
		bindplane := setupBindPlane(buffer)
		bindplane.Config.Output = yamlOutput

		cmd := AgentsCommand(bindplane)
		cmd.SetArgs([]string{"1"})
		cmd.SetOut(buffer)
		expected := `id: "1"
name: Agent 1
type: stanza
arch: amd64
hostname: local
labels: {}
version: 1.0.0
home: /stanza
platform: linux
operatingSystem: Ubuntu 20.10
macAddress: 00:00:ac:00:00:00
status: 1
`

		executeAndAssertOutput(t, cmd, buffer, expected)
	})

	t.Run("returns an error when looking up an invalid agent ID", func(t *testing.T) {
		buffer := bytes.NewBufferString("")
		bindplane := setupBindPlane(buffer)

		cmd := AgentsCommand(bindplane)
		cmd.SetArgs([]string{"badId"})
		cmd.SetOut(buffer)

		executeErr := cmd.Execute()
		require.Error(t, executeErr, "No agent found with ID badId")
	})
}
