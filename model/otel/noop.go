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

package otel

// NoopConfig returns a configuration to use that is essential a NOOP.
const NoopConfig = `# This minimal configuration is applied when a configuration
# results in a partial configuration with no pipelines.
#
# This can occur if there are only sources or only destinations
# or if there are sources and destinations but no pipelines can
# be formed because they support different types of telemetry.
#
# This configuration is designed to put a minimal load on the
# collector until a time when a new configuration is available.
# Currently the collector will refuse to run with an empty
# configuration, so instead this configuration is used.

receivers:
  hostmetrics:
    collection_interval: 1h
    scrapers:
      load:
      memory:

processors:
  batch:

exporters:
  logging:
    loglevel: info

service:
  pipelines:
    metrics:
      receivers: [hostmetrics]
      processors: [batch]
      exporters: [logging]
`
