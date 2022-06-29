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

package version

// set at compile time
var (
	gitCommit string
	gitTag    string
)

// Version contains BindPlane version information
type Version struct {
	Commit string `json:"commit"`
	Tag    string `json:"tag"`
}

// String returns the version
func (v Version) String() string {
	if v.Tag != "" {
		return v.Tag
	}

	if v.Commit != "" {
		return v.Commit
	}

	return "unknown"
}

// NewVersion returns a populated version
func NewVersion() Version {
	return Version{
		Commit: gitCommit,
		Tag:    gitTag,
	}
}
