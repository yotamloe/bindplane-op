// Copyright  observIQ, Inc
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

package common

import (
	"testing"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap/zapcore"
)

func TestNewDefaultLoggerAt(t *testing.T) {
	cases := []struct {
		name      string
		level     zapcore.Level
		path      string
		expectErr bool
	}{
		{
			"info",
			zapcore.InfoLevel,
			"/tmp/zap.log",
			false,
		},
		{
			"invalid-path-causes-error",
			zapcore.WarnLevel,
			"/tmp/valid/zap.log",
			true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			output, err := NewFileLogger(tc.level, tc.path)

			if tc.expectErr {
				require.Error(t, err, "expected an error")
				return
			}

			require.NotNil(t, output)
		})
	}
}

func TestPathToURIByOS(t *testing.T) {
	cases := []struct {
		name   string
		path   string
		goos   string
		expect string
	}{
		{
			"empty",
			"",
			"",
			"",
		},
		{
			"empty-linux",
			"",
			"linux",
			"",
		},
		{
			"empty-darwin",
			"",
			"darwin",
			"",
		},
		{
			"empty-windows",
			"",
			"windows",
			"winfile:///",
		},
		{
			"linux",
			"/var/log/bindplane/bindplane.log",
			"linux",
			"/var/log/bindplane/bindplane.log",
		},
		{
			"empty-windows",
			`D:\observiq\app.log`,
			"windows",
			"winfile:///D:\\observiq\\app.log",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			output := pathToURIByOS(tc.path, tc.goos)
			require.Equal(t, tc.expect, output)
		})
	}
}
