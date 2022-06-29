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

package flags

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAsConfigFileName(t *testing.T) {
	tests := []struct {
		name   string
		expect string
	}{
		{name: "", expect: ""},
		{name: "output", expect: "output"},
		{name: "host", expect: "host"},
		{name: "port", expect: "port"},
		{name: "server-url", expect: "serverURL"},
		{name: "remote-url", expect: "remoteURL"},
		{name: "secret-key", expect: "secretKey"},
		{name: "username", expect: "username"},
		{name: "password", expect: "password"},
		{name: "tls-cert", expect: "tlsCert"},
		{name: "tls-key", expect: "tlsKey"},
		{name: "tls-ca", expect: "tlsCa"},
		{name: "offline", expect: "offline"},
		{name: "agents-service-url", expect: "agentsServiceURL"},
		{name: "downloads-folder-path", expect: "downloadsFolderPath"},
		{name: "disable-downloads-cache", expect: "disableDownloadsCache"},
		{name: "log-file-path", expect: "logFilePath"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			value := asConfigFileName(test.name)
			require.Equal(t, test.expect, value)
		})
	}
}

func TestAsEnvVarName(t *testing.T) {
	tests := []struct {
		name   string
		expect string
	}{
		{name: "", expect: ""},
		{name: "output", expect: "OUTPUT"},
		{name: "host", expect: "HOST"},
		{name: "port", expect: "PORT"},
		{name: "server-url", expect: "SERVER_URL"},
		{name: "remote-url", expect: "REMOTE_URL"},
		{name: "secret-key", expect: "SECRET_KEY"},
		{name: "username", expect: "USERNAME"},
		{name: "password", expect: "PASSWORD"},
		{name: "tls-cert", expect: "TLS_CERT"},
		{name: "tls-key", expect: "TLS_KEY"},
		{name: "tls-ca", expect: "TLS_CA"},
		{name: "offline", expect: "OFFLINE"},
		{name: "agents-service-url", expect: "AGENTS_SERVICE_URL"},
		{name: "downloads-folder-path", expect: "DOWNLOADS_FOLDER_PATH"},
		{name: "disable-downloads-cache", expect: "DISABLE_DOWNLOADS_CACHE"},
		{name: "log-file-path", expect: "LOG_FILE_PATH"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			value := asEnvVarName(test.name)
			require.Equal(t, test.expect, value)
		})
	}
}
