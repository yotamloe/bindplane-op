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

package util

import (
	"sync"
	"time"
)

// Remember stores an item for a period of time.  It is safe to share with multiple goroutines.
type Remember[T any] interface {
	// Get returns nil if nothing is remembered or it has expired
	Get() *T
	// Update sets the thing to be remembered
	Update(*T)
}

type remember[T any] struct {
	item       *T
	expiration time.Time
	duration   time.Duration
	mtx        sync.RWMutex
}

var _ Remember[any] = (*remember[any])(nil)

// NewRemember creates an implementation of Remembered with the specified duration to remember the item
func NewRemember[T any](duration time.Duration) Remember[T] {
	return &remember[T]{
		duration: duration,
	}
}

func (v *remember[T]) Get() *T {
	v.mtx.RLock()
	defer v.mtx.RUnlock()
	if v.item != nil && now().Before(v.expiration) {
		return v.item
	}
	return nil
}

func (v *remember[T]) Update(item *T) {
	v.mtx.Lock()
	defer v.mtx.Unlock()
	v.item = item
	v.expiration = now().Add(v.duration)
}

// override for testing
var now = time.Now
