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

package rest

import (
	"github.com/gin-gonic/gin"
)

// ErrorResponse TODO(doc)
type ErrorResponse struct {
	Errors []string `json:"errors"`
}

// NewErrorResponse returns a new ErrorResponse from a given error.
func NewErrorResponse(err error) ErrorResponse {
	return ErrorResponse{Errors: []string{err.Error()}}
}

func handleErrorResponse(c *gin.Context, statusCode int, err error) {
	c.Error(err)
	c.JSON(statusCode, NewErrorResponse(err))
}
