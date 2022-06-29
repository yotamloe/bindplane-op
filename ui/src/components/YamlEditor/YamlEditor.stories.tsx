import { ComponentStory, ComponentMeta } from "@storybook/react";
import { YamlEditor } from ".";

export default {
  title: "Yaml Editor",
  component: YamlEditor,
  argTypes: {
    readOnly: {
      options: [true, false],
    },
  },
} as ComponentMeta<typeof YamlEditor>;

const Template: ComponentStory<typeof YamlEditor> = (args) => (
  <div style={{ width: "100vw" }}>
    <YamlEditor {...args} />
  </div>
);

export const Default = Template.bind({});
export const ReadOnly = Template.bind({});
export const ReadOnlyLimitHeight = Template.bind({});

Default.args = {};
ReadOnly.args = {
  value: "# Some value",
  readOnly: true,
};
ReadOnlyLimitHeight.args = {
  value: `receivers:
  hostmetrics/macOS__source0:
      host_collection_interval: 60s
      scrapers:
          filesystem: null
          load: null
          memory: null
          network: null
          paging: null
  plugin/macOS__source0__macos:
      parameters:
          - name: enable_system_log
            value: true
          - name: system_log_path
            value: /var/log/system.log
          - name: enable_install_log
            value: true
          - name: install_log_path
            value: /var/log/install.log
          - name: start_at
            value: end
      plugin:
          name: macos
processors:
  batch/googlecloud__destination0: null
  normalizesums/googlecloud__destination0: null
  resourceattributetransposer/macOS__source0:
      operations:
          - from: host.name
            to: agent
  resourcedetection/macOS__source0:
      detectors:
          - system
      system:
          hostname_sources:
              - os
exporters:
  googlecloud/googlecloud__destination0: null
service:
  pipelines:
      logs/macOS__source0__destination0:
          receivers:
              - plugin/macOS__source0__macos
          processors:
              - batch/googlecloud__destination0
          exporters:
              - googlecloud/googlecloud__destination0
      metrics/macOS__source0__destination0:
          receivers:
              - hostmetrics/macOS__source0
          processors:
              - resourcedetection/macOS__source0
              - resourceattributetransposer/macOS__source0
              - normalizesums/googlecloud__destination0
              - batch/googlecloud__destination0
          exporters:
              - googlecloud/googlecloud__destination0
receivers:
  elasticsearch/elasticsearch__source1:
      collection_interval: 60s
      endpoint: http://localhost:9200
      nodes:
          - _node
      password: null
      skip_cluster_metrics: false
      username: null
  hostmetrics/macOS__source0:
      host_collection_interval: 60s
      scrapers:
          filesystem: null
          load: null
          memory: null
          network: null
          paging: null
  plugin/elasticsearch__source1__elasticsearch:
      parameters:
          - name: enable_json_logs
            value: true
          - name: enable_gc_logs
            value: true
          - name: json_log_paths
            value:
              - /var/log/elasticsearch/*_server.json
              - /var/log/elasticsearch/*_deprecation.json
              - /var/log/elasticsearch/*_index_search_slowlog.json
              - /var/log/elasticsearch/*_index_indexing_slowlog.json
              - /var/log/elasticsearch/*_audit.json
          - name: gc_log_paths
            value:
              - /var/log/elasticsearch/gc.log*
          - name: start_at
            value: end
      plugin:
          name: elasticsearch
  plugin/macOS__source0__macos:
      parameters:
          - name: enable_system_log
            value: true
          - name: system_log_path
            value: /var/log/system.log
          - name: enable_install_log
            value: true
          - name: install_log_path
            value: /var/log/install.log
          - name: start_at
            value: end
      plugin:
          name: macos
  plugin/redis__source2__redis:
      parameters:
          - name: log_paths
            value:
              - /var/log/redis/redis-server.log /var/log/redis_6379.log /var/log/redis/redis.log /var/log/redis/default.log /var/log/redis/redis_6379.log
          - name: start_at
            value: end
      plugin:
          name: redis
  redis/redis__source2:
      collection_interval: 60s
      endpoint: http://endpoint
      password: null
      tls:
          insecure: true
      transport: tcp
processors:
  batch/googlecloud__destination0: null
  batch/newrelic_otlp__destination1: null
  normalizesums/googlecloud__destination0: null
  resourceattributetransposer/elasticsearch__source1:
      operations:
          - from: host.name
            to: agent
          - from: elasticsearch.node.name
            to: node_name
          - from: elasticsearch.cluster.name
            to: cluster_name
  resourceattributetransposer/macOS__source0:
      operations:
          - from: host.name
            to: agent
  resourceattributetransposer/redis__source2:
      operations:
          - from: host.name
            to: agent
  resourcedetection/elasticsearch__source1:
      detectors:
          - system
      system:
          hostname_sources:
              - os
  resourcedetection/macOS__source0:
      detectors:
          - system
      system:
          hostname_sources:
              - os
  resourcedetection/redis__source2:
      detectors:
          - system
      system:
          hostname_sources:
              - os
exporters:
  googlecloud/googlecloud__destination0: null
  otlp/newrelic_otlp__destination1:
      endpoint: https://otlp.nr-data.net:443
      headers:
          - api-key: null
      tls:
          insecure: false
service:
  pipelines:
      logs/elasticsearch__source1__destination0:
          receivers:
              - plugin/elasticsearch__source1__elasticsearch
          processors:
              - batch/googlecloud__destination0
          exporters:
              - googlecloud/googlecloud__destination0
      logs/macOS__source0__destination0:
          receivers:
              - plugin/macOS__source0__macos
          processors:
              - batch/googlecloud__destination0
          exporters:
              - googlecloud/googlecloud__destination0
      logs/redis__source2__destination0:
          receivers:
              - plugin/redis__source2__redis
          processors:
              - batch/googlecloud__destination0
          exporters:
              - googlecloud/googlecloud__destination0
      metrics/elasticsearch__source1__destination0:
          receivers:
              - elasticsearch/elasticsearch__source1
          processors:
              - resourcedetection/elasticsearch__source1
              - resourceattributetransposer/elasticsearch__source1
              - normalizesums/googlecloud__destination0
              - batch/googlecloud__destination0
          exporters:
              - googlecloud/googlecloud__destination0
      metrics/elasticsearch__source1__destination1:
          receivers:
              - elasticsearch/elasticsearch__source1
          processors:
              - resourcedetection/elasticsearch__source1
              - resourceattributetransposer/elasticsearch__source1
              - batch/newrelic_otlp__destination1
          exporters:
              - otlp/newrelic_otlp__destination1
      metrics/macOS__source0__destination0:
          receivers:
              - hostmetrics/macOS__source0
          processors:
              - resourcedetection/macOS__source0
              - resourceattributetransposer/macOS__source0
              - normalizesums/googlecloud__destination0
              - batch/googlecloud__destination0
          exporters:
              - googlecloud/googlecloud__destination0
      metrics/macOS__source0__destination1:
          receivers:
              - hostmetrics/macOS__source0
          processors:
              - resourcedetection/macOS__source0
              - resourceattributetransposer/macOS__source0
              - batch/newrelic_otlp__destination1
          exporters:
              - otlp/newrelic_otlp__destination1
      metrics/redis__source2__destination0:
          receivers:
              - redis/redis__source2
          processors:
              - resourcedetection/redis__source2
              - resourceattributetransposer/redis__source2
              - normalizesums/googlecloud__destination0
              - batch/googlecloud__destination0
          exporters:
              - googlecloud/googlecloud__destination0
      metrics/redis__source2__destination1:
          receivers:
              - redis/redis__source2
          processors:
              - resourcedetection/redis__source2
              - resourceattributetransposer/redis__source2
              - batch/newrelic_otlp__destination1
          exporters:
              - otlp/newrelic_otlp__destination1
  
  `,
  limitHeight: true,
  readOnly: true,
};
