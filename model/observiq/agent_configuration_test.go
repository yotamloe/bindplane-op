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

package observiq

import (
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestReplaceLabels(t *testing.T) {
	tests := []struct {
		name   string
		config *AgentConfiguration
		labels string
		verify func(t *testing.T, config *AgentConfiguration)
	}{
		{
			name: "empty, empty",
			config: &AgentConfiguration{
				Manager: &ManagerConfig{},
			},
			labels: "",
			verify: func(t *testing.T, config *AgentConfiguration) {
				require.NotNil(t, config.Manager)
				require.Equal(t, "", config.Manager.Labels)
			},
		},
		{
			name:   "nil, empty",
			config: &AgentConfiguration{},
			labels: "",
			verify: func(t *testing.T, config *AgentConfiguration) {
				// was nil, remains nil
				require.Nil(t, config.Manager)
			},
		},
		{
			name:   "nil, labels",
			config: &AgentConfiguration{},
			labels: "labels",
			verify: func(t *testing.T, config *AgentConfiguration) {
				// was nil, created
				require.NotNil(t, config.Manager)
				require.Equal(t, "labels", config.Manager.Labels)
			},
		},
		{
			name: "same, same",
			config: &AgentConfiguration{
				Manager: &ManagerConfig{Labels: "same"},
			},
			labels: "same",
			verify: func(t *testing.T, config *AgentConfiguration) {
				require.NotNil(t, config.Manager)
				require.Equal(t, "same", config.Manager.Labels)
			},
		},
		{
			name: "old, new",
			config: &AgentConfiguration{
				Manager: &ManagerConfig{Labels: "old"},
			},
			labels: "new",
			verify: func(t *testing.T, config *AgentConfiguration) {
				require.NotNil(t, config.Manager)
				require.Equal(t, "new", config.Manager.Labels)
			},
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			test.config.ReplaceLabels(test.labels)
			test.verify(t, test.config)
		})
	}
}

func TestAgentConfigurationParse(t *testing.T) {
	tests := []struct {
		name   string
		raw    RawAgentConfiguration
		verify func(t *testing.T, config *AgentConfiguration, err error)
	}{
		{
			name: "empty",
			raw:  RawAgentConfiguration{},
			verify: func(t *testing.T, config *AgentConfiguration, err error) {
				require.NoError(t, err)
				require.NotNil(t, config)
				require.Equal(t, "", config.Collector)
				require.Equal(t, "", config.Logging)
				require.Nil(t, config.Manager)
			},
		},
		{
			name: "complete",
			raw: RawAgentConfiguration{
				Manager: []byte(`
endpoint: endpoint
protocol: protocol
cacert: cacert
tlscert: tlscert
tlskey: tlskey
agent_name: agent_name
agent_id: agent_id
secret_key: secret_key
status_interval: 1s
reconnect_interval: 2s
max_connect_backoff: 3s
buffer_size: 4
template_id: template_id
labels: labels
`),
				Collector: []byte("collector"),
				Logging:   []byte("logging"),
			},
			verify: func(t *testing.T, config *AgentConfiguration, err error) {
				require.NoError(t, err)
				require.NotNil(t, config)
				require.Equal(t, "collector", config.Collector)
				require.Equal(t, "logging", config.Logging)
				require.NotNil(t, config.Manager)

				// validate fields
				require.Equal(t, "endpoint", config.Manager.Endpoint)
				require.Equal(t, "protocol", config.Manager.Protocol)
				require.Equal(t, "cacert", config.Manager.CACertFile)
				require.Equal(t, "tlscert", config.Manager.TLSCertFile)
				require.Equal(t, "tlskey", config.Manager.TLSKeyFile)
				require.Equal(t, "agent_name", config.Manager.AgentName)
				require.Equal(t, "agent_id", config.Manager.AgentID)
				require.Equal(t, "secret_key", config.Manager.SecretKey)
				require.Equal(t, 1*time.Second, config.Manager.StatusInterval)
				require.Equal(t, 2*time.Second, config.Manager.ReconnectInterval)
				require.Equal(t, 3*time.Second, config.Manager.MaxConnectBackoff)
				require.Equal(t, 4, config.Manager.BufferSize)
				require.Equal(t, "template_id", config.Manager.TemplateID)
				require.Equal(t, "labels", config.Manager.Labels)
			},
		},
		{
			name: "parse yaml error",
			raw: RawAgentConfiguration{
				Manager: []byte("not yaml"),
			},
			verify: func(t *testing.T, config *AgentConfiguration, err error) {
				require.Error(t, err)
				require.Nil(t, config)
			},
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			config, err := test.raw.Parse()
			test.verify(t, config, err)
		})
	}
}

func TestAgentConfigurationMarshal(t *testing.T) {
	tests := []struct {
		name          string
		configuration AgentConfiguration
		verify        func(t *testing.T, raw *RawAgentConfiguration)
	}{
		{
			name:          "empty",
			configuration: AgentConfiguration{},
			verify: func(t *testing.T, raw *RawAgentConfiguration) {
				require.Equal(t, "", string(raw.Logging))
				require.Equal(t, "", string(raw.Collector))
				require.Nil(t, raw.Manager)
			},
		},
		{
			name: "complete",
			configuration: AgentConfiguration{
				Logging:   "logging",
				Collector: "collector",
				Manager: &ManagerConfig{
					Endpoint:          "endpoint",
					Protocol:          "protocol",
					CACertFile:        "cacert",
					TLSCertFile:       "tlscert",
					TLSKeyFile:        "tlskey",
					AgentName:         "agent_name",
					AgentID:           "agent_id",
					SecretKey:         "secret_key",
					StatusInterval:    1 * time.Second,
					ReconnectInterval: 2 * time.Second,
					MaxConnectBackoff: 3 * time.Second,
					BufferSize:        4,
					TemplateID:        "template_id",
					Labels:            "labels",
				},
			},
			verify: func(t *testing.T, raw *RawAgentConfiguration) {
				require.Equal(t, "logging", string(raw.Logging))
				require.Equal(t, "collector", string(raw.Collector))
				require.Equal(t, strings.TrimLeft(`
endpoint: endpoint
protocol: protocol
cacert: cacert
tlscert: tlscert
tlskey: tlskey
agent_name: agent_name
agent_id: agent_id
secret_key: secret_key
status_interval: 1s
reconnect_interval: 2s
max_connect_backoff: 3s
buffer_size: 4
template_id: template_id
labels: labels
`, "\n"), string(raw.Manager))
			},
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			raw := test.configuration.Raw()
			test.verify(t, &raw)
		})
	}
}

func TestAgentConfigurationComputeConfigurationUpdates(t *testing.T) {
	tests := []struct {
		name        string
		server      AgentConfiguration
		agent       AgentConfiguration
		expect      AgentConfiguration
		expectEmpty bool
	}{
		{
			name:        "empty",
			server:      AgentConfiguration{},
			agent:       AgentConfiguration{},
			expect:      AgentConfiguration{},
			expectEmpty: true,
		},
		{
			name: "same",
			server: AgentConfiguration{
				Collector: "collector",
				Logging:   "logging",
				Manager: &ManagerConfig{
					BufferSize: 10,
				},
			},
			agent: AgentConfiguration{
				Collector: "collector",
				Logging:   "logging",
				Manager: &ManagerConfig{
					BufferSize: 10,
				},
			},
			expect:      AgentConfiguration{},
			expectEmpty: true,
		},
		{
			name: "logging ignored",
			server: AgentConfiguration{
				Logging: "ignored",
			},
			agent: AgentConfiguration{
				Logging: "different",
			},
			expect:      AgentConfiguration{},
			expectEmpty: true,
		},
		{
			name: "collector different",
			server: AgentConfiguration{
				Collector: "collector",
			},
			agent: AgentConfiguration{
				Collector: "different",
			},
			expect: AgentConfiguration{
				Collector: "collector",
			},
			expectEmpty: false,
		},
		{
			name: "non-label manager changes ignored",
			server: AgentConfiguration{
				Manager: &ManagerConfig{
					BufferSize: 1,
				},
			},
			agent: AgentConfiguration{
				Manager: &ManagerConfig{
					BufferSize: 2,
				},
			},
			expect:      AgentConfiguration{},
			expectEmpty: true,
		},
		{
			name: "label change, no manager",
			server: AgentConfiguration{
				Manager: &ManagerConfig{
					Labels: "foo=bar",
				},
			},
			agent: AgentConfiguration{},
			expect: AgentConfiguration{
				Manager: &ManagerConfig{
					Labels: "foo=bar",
				},
			},
			expectEmpty: false,
		},
		{
			name: "label change, different labels",
			server: AgentConfiguration{
				Manager: &ManagerConfig{
					Labels: "foo=bar",
				},
			},
			agent: AgentConfiguration{
				Manager: &ManagerConfig{
					Labels: "foo=baz",
				},
			},
			expect: AgentConfiguration{
				Manager: &ManagerConfig{
					Labels: "foo=bar",
				},
			},
			expectEmpty: false,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			diff := ComputeConfigurationUpdates(&test.server, &test.agent)
			require.Equal(t, test.expectEmpty, diff.Empty())
			verifyAgentConfiguration(t, test.expect, &diff)
		})
	}
}

func verifyAgentConfiguration(t *testing.T, expect AgentConfiguration, diff *AgentConfiguration) {
	require.Equal(t, expect.Logging, diff.Logging)
	require.Equal(t, expect.Collector, diff.Collector)
	if expect.Manager == nil {
		require.Nil(t, diff.Manager)
		return
	}
	require.NotNil(t, diff.Manager)

	// compare individual manager fields
	require.Equal(t, expect.Manager.Endpoint, diff.Manager.Endpoint)
	require.Equal(t, expect.Manager.Protocol, diff.Manager.Protocol)
	require.Equal(t, expect.Manager.CACertFile, diff.Manager.CACertFile)
	require.Equal(t, expect.Manager.TLSCertFile, diff.Manager.TLSCertFile)
	require.Equal(t, expect.Manager.TLSKeyFile, diff.Manager.TLSKeyFile)
	require.Equal(t, expect.Manager.AgentName, diff.Manager.AgentName)
	require.Equal(t, expect.Manager.AgentID, diff.Manager.AgentID)
	require.Equal(t, expect.Manager.SecretKey, diff.Manager.SecretKey)
	require.Equal(t, expect.Manager.StatusInterval, diff.Manager.StatusInterval)
	require.Equal(t, expect.Manager.ReconnectInterval, diff.Manager.ReconnectInterval)
	require.Equal(t, expect.Manager.MaxConnectBackoff, diff.Manager.MaxConnectBackoff)
	require.Equal(t, expect.Manager.BufferSize, diff.Manager.BufferSize)
	require.Equal(t, expect.Manager.TemplateID, diff.Manager.TemplateID)
	require.Equal(t, expect.Manager.Labels, diff.Manager.Labels)
}

func TestAgentConfigurationApplyUpdates(t *testing.T) {
	tests := []struct {
		name    string
		current RawAgentConfiguration
		updates *RawAgentConfiguration
		expect  RawAgentConfiguration
	}{
		{
			name:    "empty",
			current: RawAgentConfiguration{},
			updates: &RawAgentConfiguration{},
			expect:  RawAgentConfiguration{},
		},
		{
			name:    "nil",
			current: RawAgentConfiguration{},
			updates: nil,
			expect:  RawAgentConfiguration{},
		},
		{
			name: "partial",
			current: RawAgentConfiguration{
				Logging:   []byte("logging"),
				Collector: nil,
				Manager:   nil,
			},
			updates: &RawAgentConfiguration{
				Logging:   []byte("different"),
				Collector: []byte("collector"),
			},
			expect: RawAgentConfiguration{
				Logging:   []byte("different"),
				Collector: []byte("collector"),
			},
		},
		{
			name: "complete",
			current: RawAgentConfiguration{
				Logging:   []byte("logging"),
				Collector: []byte("collector"),
				Manager:   []byte("labels: foo=bar"),
			},
			updates: &RawAgentConfiguration{
				Logging:   []byte("logging2"),
				Collector: []byte("collector2"),
				Manager:   []byte("labels: foo=baz"),
			},
			expect: RawAgentConfiguration{
				Logging:   []byte("logging2"),
				Collector: []byte("collector2"),
				Manager:   []byte("labels: foo=baz"),
			},
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := test.current.ApplyUpdates(test.updates)
			require.Equal(t, string(test.expect.Collector), string(result.Collector), "Collector")
			require.Equal(t, string(test.expect.Logging), string(result.Logging), "Logging")
			require.Equal(t, string(test.expect.Manager), string(result.Manager), "Manager")
		})
	}
}

func TestAgentConfigurationHash(t *testing.T) {
	raw := RawAgentConfiguration{
		Logging:   []byte("logging"),
		Collector: []byte("collector"),
	}
	require.ElementsMatch(t, []byte{
		2, 159, 2, 3, 209, 111, 244, 145, 150, 81, 82, 158, 180, 134, 62, 7, 151, 74, 32, 121, 111, 156, 37, 229, 4, 136, 76, 189, 127, 213, 126, 210,
	}, raw.Hash())
}

func TestDecodeAgentConfiguration(t *testing.T) {
	tests := []struct {
		name          string
		configuration interface{}
		expect        AgentConfiguration
		expectError   bool
	}{
		{
			name:          "nil",
			configuration: nil,
			expect:        AgentConfiguration{},
		},
		{
			name:          "empty",
			configuration: map[string]interface{}{},
			expect:        AgentConfiguration{},
		},
		{
			name: "malformed",
			configuration: map[string]interface{}{
				"Collector": map[string]interface{}{
					"something": "Collector should be a string",
				},
			},
			expectError: true,
		},
		{
			name: "complete",
			configuration: map[string]interface{}{
				"collector": "collector contents",
				"logging":   "logging contents",
				"manager": map[string]interface{}{
					"endpoint":            "endpoint",
					"protocol":            "protocol",
					"cacert":              "cacert",
					"tlscert":             "tlscert",
					"tlskey":              "tlskey",
					"agent_name":          "agent_name",
					"agent_id":            "agent_id",
					"secret_key":          "secret_key",
					"status_interval":     1 * time.Second,
					"reconnect_interval":  2 * time.Second,
					"max_connect_backoff": 3 * time.Second,
					"buffer_size":         4,
					"template_id":         "template_id",
					"labels":              "labels",
				},
			},
			expect: AgentConfiguration{
				Logging:   "logging contents",
				Collector: "collector contents",
				Manager: &ManagerConfig{
					Endpoint: "endpoint",
					Protocol: "protocol", CACertFile: "cacert", TLSCertFile: "tlscert", TLSKeyFile: "tlskey", AgentName: "agent_name", AgentID: "agent_id", SecretKey: "secret_key", StatusInterval: 1000000000, ReconnectInterval: 2000000000, MaxConnectBackoff: 3000000000, BufferSize: 4, TemplateID: "template_id", Labels: "labels", Headless: false},
			},
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			config, err := DecodeAgentConfiguration(test.configuration)
			if test.expectError {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			verifyAgentConfiguration(t, test.expect, config)
		})
	}
}
