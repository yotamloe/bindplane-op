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
	"fmt"

	"github.com/spf13/cobra"
)

// DeleteCommand returns the BindPlane profile delete cobra command
func DeleteCommand(h Helper) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "delete <name>",
		Short: "delete a saved profile",
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 0 {
				return fmt.Errorf("missing required argument <name>")
			}

			name := args[0]

			err := h.Folder().RemoveProfile(name)
			if err != nil {
				return err
			}

			fmt.Fprintf(cmd.OutOrStdout(), "deleted saved profile '%s'\n", name)
			return nil
		},
	}
	return cmd
}
