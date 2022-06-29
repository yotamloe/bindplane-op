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
	"io"
)

type nopCacheArtifact struct{}

var errNopArtifact = errors.New("artifact does not exist")

func (n nopCacheArtifact) Name() string                   { return "" }
func (n nopCacheArtifact) Path() string                   { return "" }
func (n nopCacheArtifact) Exists() bool                   { return false }
func (n nopCacheArtifact) Read() ([]byte, error)          { return nil, errNopArtifact }
func (n nopCacheArtifact) Reader() (io.ReadCloser, error) { return nil, errNopArtifact }
func (n nopCacheArtifact) Write([]byte) error             { return nil }
func (n nopCacheArtifact) Writer() io.WriteCloser         { return nopWriter{} }

var nop = nopCacheArtifact{}

// nopCache TODO(doc)
type nopCache struct{}

func (n *nopCache) Enabled() bool              { return false }
func (n *nopCache) LatestVersion() *Version    { return nil }
func (n *nopCache) SaveLatestVersion(*Version) {}
func (n *nopCache) Version(string) *Version    { return nil }
func (n *nopCache) SaveVersion(*Version)       {}
func (n *nopCache) Artifact(artifactType ArtifactType, version *Version, platform string) CacheArtifact {
	return nop
}

type nopWriter struct{}

// Write TODO(doc)
func (nopWriter) Write(p []byte) (n int, err error) { return len(p), nil }

// Close closes the writer
func (nopWriter) Close() error { return nil }
