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

// UseCommand returns the BindPlane profile use cobra command
func UseCommand(h Helper) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "use <name>",
		Short: "specify the default saved context to use",
		// override PersistentPreRunE because the "use" command does not need to load current configuration (and may be
		// invalid, see #587)
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error { return nil },
		RunE: func(cmd *cobra.Command, args []string) error {
			if len(args) == 0 {
				return fmt.Errorf("missing required argument <name>")
			}

			name := args[0]

			err := h.Folder().SetCurrentProfileName(name)
			if err != nil {
				return err
			}

			return nil
		},
	}
	return cmd
}
