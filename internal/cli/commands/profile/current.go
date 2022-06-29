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

// CurrentCommand returns the BindPlane profile current cobra command
func CurrentCommand(h Helper) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "current",
		Short: "returns the name of the currently used profile",
		RunE: func(cmd *cobra.Command, args []string) error {
			current, err := h.Folder().CurrentProfileName()
			if err != nil || current == "" {
				fmt.Fprintf(cmd.OutOrStdout(), "no saved profile specified\n")
				return nil
			}
			fmt.Fprintf(cmd.OutOrStdout(), "%s\n", current)
			return nil
		},
	}

	return cmd
}
