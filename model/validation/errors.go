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

package validation

import "github.com/hashicorp/go-multierror"

// Errors provides an ErrorReporter to accumulate errors.
type Errors interface {
	// Add adds an error to the set of errors accumulated by Errors. If err is nil, this does nothing.
	Add(err error)
	// Result returns an error containing all of the errors accumulated or nil if there were no errors
	Result() error
}

type errorsImpl struct {
	err error
}

var _ Errors = (*errorsImpl)(nil)

// NewErrors creates new validation errors and returns the reporter as a convenience
func NewErrors() Errors {
	return &errorsImpl{}
}

func (v *errorsImpl) Add(err error) {
	if err != nil {
		v.err = multierror.Append(v.err, err)
	}
}

func (v *errorsImpl) Result() error {
	return v.err
}
