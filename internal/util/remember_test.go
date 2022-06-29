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
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

var testTime = time.Now()

func advanceTime(d time.Duration) {
	testTime = testTime.Add(d)
}

func testNow() time.Time {
	return testTime
}

type item struct {
	value int
}

func TestRemember(t *testing.T) {
	now = testNow

	rem := NewRemember[item](time.Minute)
	require.Nil(t, rem.Get())

	rem.Update(&item{3})
	require.NotNil(t, rem.Get())
	require.Equal(t, 3, rem.Get().value)

	rem.Update(&item{5})
	require.NotNil(t, rem.Get())
	require.Equal(t, 5, rem.Get().value)

	advanceTime(time.Hour)
	require.Nil(t, rem.Get())

	rem.Update(&item{7})
	require.NotNil(t, rem.Get())
	require.Equal(t, 7, rem.Get().value)

	advanceTime(time.Second)
	require.NotNil(t, rem.Get())
	require.Equal(t, 7, rem.Get().value)
}
