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

// ListCommand returns the BindPlane profile list cobra command
func ListCommand(h Helper) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "list",
		Short: "list the available saved profiles",
		RunE: func(cmd *cobra.Command, args []string) error {
			names := h.Folder().ProfileNames()

			if len(names) == 0 {
				fmt.Fprintf(cmd.OutOrStdout(), "%s\n", "No saved profiles found.")
			}

			for _, name := range names {
				fmt.Fprintf(cmd.OutOrStdout(), "%s\n", name)
			}
			return nil
		},
	}
	return cmd
}
