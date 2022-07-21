package livetail

import (
	"github.com/observiq/bindplane-op/model/otel"
)

type message struct {
	Sessions     []string          `json:"sessions"`
	Records      []any             `json:"records"`
	PipelineType otel.PipelineType `json:"pipelineType"`
}
