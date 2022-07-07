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

package update

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/observiq/bindplane-op/internal/cli"
)

var (
	versionFlag string
)

// AgentCommand returns the iris update agent cobra command
func AgentCommand(bindplane *cli.BindPlane) *cobra.Command {
	cmd := &cobra.Command{
		Use:     "agent [id]",
		Aliases: []string{"agents"},
		Short:   "Initiates an update of an agent or agents",
		Long:    `An agent collects logs, metrics, and traces for sources and sends them to destinations.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 0 {
				return fmt.Errorf("id of the agent must be specified")
			}

			c, err := bindplane.Client()
			if err != nil {
				return fmt.Errorf("error creating client: %w", err)
			}

			for _, id := range args {
				err := c.AgentUpdate(cmd.Context(), id, versionFlag)
				if err != nil {
					return err
				}
			}

			return nil
		},
	}

	cmd.Flags().StringVar(&versionFlag, "version", "latest", "version of the agent to install")

	return cmd
}
