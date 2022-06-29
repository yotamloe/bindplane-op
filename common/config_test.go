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

package common

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestInitConfig(t *testing.T) {
	cases := []struct {
		name      string
		directory string
		expect    *Config
	}{
		{
			"empty",
			"",
			&Config{},
		},
		{
			"tmp",
			"/tmp/bindplane",
			&Config{
				Server: Server{
					Common: Common{
						bindplaneHomePath: "/tmp/bindplane",
					},
				},
				Client: Client{
					Common: Common{
						bindplaneHomePath: "/tmp/bindplane",
					},
				},
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			output := InitConfig(tc.directory)
			require.Equal(t, tc.expect, output, "expected output config to be equal to input config")
		})
	}
}

func TestBindAddress(t *testing.T) {
	cases := []struct {
		name       string
		serverConf *Server
		expect     string
	}{
		{
			"empty",
			&Server{},
			":",
		},
		{
			"localhost_5000",
			&Server{
				Common: Common{
					Host: "localhost",
					Port: "5000",
				},
			},
			"localhost:5000",
		},
		{
			"arbitrary",
			&Server{
				Common: Common{
					Host: "x",
					Port: "y",
				},
			},
			"x:y",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			output := tc.serverConf.BindAddress()
			require.Equal(t, tc.expect, output)
		})
	}
}

func TestRemoteURL(t *testing.T) {
	cases := []struct {
		name       string
		serverConf *Server
		expect     string
	}{
		{
			"empty",
			&Server{},
			"",
		},
		{
			"localhost_4000",
			&Server{
				Common: Common{
					Host: "localhost",
					Port: "4000",
				},
			},
			"ws://localhost:4000",
		},
		{
			"NAT",
			&Server{
				Common: Common{
					Host: "localhost",
					Port: "4000",
				},
				RemoteURL: "ws://otel.org",
			},
			"ws://otel.org",
		},
		{
			"NAT_without_host_port",
			&Server{
				RemoteURL: "ws://otel.org",
			},
			"ws://otel.org",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			output := tc.serverConf.WebsocketURL()
			require.Equal(t, tc.expect, output)
		})
	}
}

func TestStoragePath(t *testing.T) {
	cases := []struct {
		name       string
		serverConf *Server
		expect     string
	}{
		{
			"empty",
			&Server{},
			"storage",
		},
		{
			"directory",
			&Server{
				Common: Common{
					bindplaneHomePath: "/var/lib/bindplane",
				},
			},
			"/var/lib/bindplane/storage",
		},
		{
			"storage_path",
			&Server{
				StorageFilePath: "/opt/bindplane/bindplane.db",
			},
			"/opt/bindplane/bindplane.db",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			output := tc.serverConf.BoltDatabasePath()
			require.Equal(t, tc.expect, output)
		})
	}
}

func TestServerURL(t *testing.T) {
	cases := []struct {
		name   string
		conf   *Common
		expect string
	}{
		{
			"empty",
			&Common{},
			"",
		},
		{
			"serveraddress",
			&Common{
				ServerURL: "https://bindplane.otel.net:4444",
			},
			"https://bindplane.otel.net:4444",
		},
		{
			"hostport",
			&Common{
				Host: "medora",
				Port: "5000",
			},
			"http://medora:5000",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			output := tc.conf.BindPlaneURL()
			require.Equal(t, tc.expect, output)
		})
	}
}

func TestEnableTLS(t *testing.T) {
	cases := []struct {
		name   string
		config Common
		expect bool
	}{
		{
			"no-tls",
			Common{
				TLSConfig: TLSConfig{},
			},
			false,
		},
		{
			"tls",
			Common{
				TLSConfig: TLSConfig{
					Certificate: "server.crt",
					PrivateKey:  "server.key",
				},
			},
			true,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			require.Equal(t, tc.expect, tc.config.EnableTLS())
		})
	}
}

func TestWebSocketScheme(t *testing.T) {
	cases := []struct {
		name   string
		config Common
		expect string
	}{
		{
			"ws",
			Common{
				TLSConfig: TLSConfig{},
			},
			"ws",
		},
		{
			"wss",
			Common{
				TLSConfig: TLSConfig{
					Certificate: "server.crt",
					PrivateKey:  "server.key",
				},
			},
			"wss",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			require.Equal(t, tc.expect, tc.config.WebsocketScheme())
		})
	}
}

func TestServerScheme(t *testing.T) {
	cases := []struct {
		name   string
		config Common
		expect string
	}{
		{
			"http",
			Common{
				TLSConfig: TLSConfig{},
			},
			"http",
		},
		{
			"https",
			Common{
				TLSConfig: TLSConfig{
					Certificate: "server.crt",
					PrivateKey:  "server.key",
				},
			},
			"https",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			require.Equal(t, tc.expect, tc.config.ServerScheme())
		})
	}
}
