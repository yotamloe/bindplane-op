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
	"gopkg.in/yaml.v2"
)

// When --current is set, just return the currently specified profile
var currentFlag bool

// GetCommand returns the BindPlane profile get cobra command
func GetCommand(h Helper) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "get <name>",
		Short: "Get details on a saved profile.",
		RunE: func(cmd *cobra.Command, args []string) error {
			var name string

			// return the current context if --current-context is passed
			if currentFlag || len(args) == 0 {
				n, err := h.Folder().CurrentProfileName()
				if err != nil {
					return err
				}
				name = n
			} else {
				name = args[0]
			}

			if !h.Folder().ProfileExists(name) {
				return fmt.Errorf("no profile with name '%s' found", name)
			}

			profile, err := h.Folder().ReadProfile(name)
			if err != nil {
				return err
			}

			// Printing the yaml for now
			b, err := yaml.Marshal(profile)
			if err != nil {
				return err
			}
			fmt.Fprintf(cmd.OutOrStdout(), "%s", string(b))

			return nil
		},
	}

	cmd.Flags().BoolVar(&currentFlag, "current", false, "show the settings for the current profile")
	return cmd
}
