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

package model

// DestinationType is a ResourceType used to define destinations
type DestinationType struct {
	ResourceType `yaml:",inline" json:",inline" mapstructure:",squash"`
}

// NewDestinationType creates a new sourtype with the specified name,
func NewDestinationType(name string, parameters []ParameterDefinition) *DestinationType {
	return NewDestinationTypeWithSpec(name, ResourceTypeSpec{
		Parameters: parameters,
	})
}

// NewDestinationTypeWithSpec creates a new sourtype with the specified name and spec.
func NewDestinationTypeWithSpec(name string, spec ResourceTypeSpec) *DestinationType {
	return &DestinationType{
		ResourceType: ResourceType{
			ResourceMeta: ResourceMeta{
				APIVersion: V1Alpha,
				Kind:       KindDestinationType,
				Metadata: Metadata{
					Name: name,
				},
			},
			Spec: spec,
		},
	}
}

// GetKind returns "DestinationType"
func (d *DestinationType) GetKind() Kind { return KindDestinationType }
