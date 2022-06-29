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

package agent

import (
	"errors"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/go-resty/resty/v2"
)

const (
	// DefaultAgentVersionsURL is the default endpoint for retrieving agent releases.
	DefaultAgentVersionsURL = "https://agents.app.observiq.com"
)

var (
	// ErrVersionNotFound is returned when the agent versions service returns a 404 for a version
	ErrVersionNotFound = errors.New("agent version not found")
)

type agentVersionResponse struct {
	Version Version `json:"agentVersion"`
}

// Client TODO(doc)
type Client interface {
	Version(version string) (*Version, error)
	LatestVersion() (*Version, error)

	Artifact(artifactType ArtifactType, version *Version, platform string) Artifact
}

// ClientSettings TODO(doc)
type ClientSettings struct {
	AgentVersionsURL string
}

// ----------------------------------------------------------------------

type client struct {
	client *resty.Client
}

var _ Client = (*client)(nil)

// NewClient constructs a new Client implementation with the specified settings.
func NewClient(settings ClientSettings) Client {
	c := resty.New()
	c.SetTimeout(time.Second * 20)
	c.SetBaseURL(settings.AgentVersionsURL)
	return &client{
		client: c,
	}
}

// LatestVersion returns the latest agent release.
func (c *client) LatestVersion() (*Version, error) {
	return c.Version(VersionLatest)
}

func (c *client) Version(version string) (*Version, error) {
	var response agentVersionResponse

	url := fmt.Sprintf("/agent-versions/%s", version)
	res, err := c.client.R().SetResult(&response).Get(url)
	if err != nil {
		return nil, err
	}
	if res.StatusCode() == 404 {
		return nil, ErrVersionNotFound
	}
	if res.StatusCode() != 200 {
		return nil, fmt.Errorf("Unable to get version %s: %s", version, res.Status())
	}

	return &response.Version, nil
}

func (c *client) Artifact(artifactType ArtifactType, version *Version, platform string) Artifact {
	return c.artifact(version.ArtifactURL(artifactType, platform))
}

// ----------------------------------------------------------------------

func (c *client) artifact(url string) Artifact {
	return &remoteArtifact{
		url:    url,
		client: c,
	}
}

func (c *client) reader(url string) (io.ReadCloser, error) {
	response, err := c.client.R().SetDoNotParseResponse(true).Get(url)
	if err != nil {
		return nil, err
	}
	return response.RawBody(), nil
}

// ----------------------------------------------------------------------
type remoteArtifact struct {
	url    string
	client *client
}

var _ Artifact = (*remoteArtifact)(nil)

func (a *remoteArtifact) Name() string {
	parts := strings.Split(a.url, "/")
	return parts[len(parts)-1]
}

func (a *remoteArtifact) Reader() (io.ReadCloser, error) {
	return a.client.reader(a.url)
}
