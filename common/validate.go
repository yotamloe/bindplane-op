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
	"errors"
	"fmt"
	"net/url"
	"os"
	"strconv"

	"github.com/google/uuid"
	"github.com/hashicorp/go-multierror"
)

// Validate checks the runtime configuration for issues and returns all
// errors, if any.
func (c *Config) Validate() (errGroup error) {
	// Validate server config
	if err := c.Server.validate(); err != nil {
		errGroup = multierror.Append(errGroup, err)
	}

	// Validate client config
	if err := c.Client.validate(); err != nil {
		errGroup = multierror.Append(errGroup, err)
	}

	return errGroup
}

func (s *Server) validate() (errGroup error) {
	if s.StorageFilePath != "" {
		if _, err := os.Stat(s.StorageFilePath); err != nil {
			err = fmt.Errorf("failed to lookup storage file path %s: %w", s.StorageFilePath, err)
			errGroup = multierror.Append(errGroup, err)
		}
	}

	if err := validateUUID(s.SecretKey); err != nil {
		err = fmt.Errorf("failed to validate secret key: %w", err)
		errGroup = multierror.Append(errGroup, err)
	}

	if err := validateURL(s.RemoteURL, []string{"ws", "wss"}); err != nil {
		err = fmt.Errorf("failed to validate remote address %s: %w", s.RemoteURL, err)
		errGroup = multierror.Append(errGroup, err)
	}

	if err := validateURL(s.AgentsServiceURL, []string{"http", "https"}); err != nil {
		err = fmt.Errorf("failed to validate agents service url %s: %w", s.AgentsServiceURL, err)
		errGroup = multierror.Append(errGroup, err)
	}

	if s.DownloadsFolderPath != "" {
		if _, err := os.Stat(s.DownloadsFolderPath); err != nil {
			err = fmt.Errorf("failed to lookup agents cache path %s: %w", s.DownloadsFolderPath, err)
			errGroup = multierror.Append(errGroup, err)
		}
	}

	if err := s.Common.validate(); err != nil {
		errGroup = multierror.Append(errGroup, err)
	}

	return errGroup
}

func (c *Client) validate() (errGroup error) {
	return c.Common.validate()
}

func (c *Common) validate() (errGroup error) {
	if c.BindPlaneHomePath() != "" {
		if _, err := os.Stat(c.BindPlaneHomePath()); err != nil {
			err = fmt.Errorf("failed to lookup directory %s: %w", c.BindPlaneHomePath(), err)
			errGroup = multierror.Append(errGroup, err)
		}
	}

	if err := validPort(c.Port); err != nil {
		errGroup = multierror.Append(errGroup, err)
	}

	if err := validateURL(c.ServerURL, []string{"http", "https"}); err != nil {
		err = fmt.Errorf("failed to validate server address %s: %w", c.ServerURL, err)
		errGroup = multierror.Append(errGroup, err)
	}

	if err := c.validateTLSConfig(); err != nil {
		errGroup = multierror.Append(errGroup, err)
	}

	return errGroup
}

func (c *Common) validateTLSConfig() error {
	if c.Certificate != "" && c.PrivateKey == "" {
		return errors.New("tls private key must be set when tls certificate is set")
	}

	if c.Certificate == "" && c.PrivateKey != "" {
		return errors.New("tls certificate must be set when tls private key is set")
	}

	caCerts := len(c.CertificateAuthority)
	if caCerts > 0 && c.Certificate == "" || caCerts > 0 && c.PrivateKey == "" {
		return errors.New("tls certificate and private key must be set when tls certificate authority is set")
	}

	if c.Certificate != "" {
		if _, err := os.Stat(c.Certificate); err != nil {
			return fmt.Errorf("failed to lookup tls certificate file %s: %w", c.Certificate, err)
		}
	}

	if c.PrivateKey != "" {
		if _, err := os.Stat(c.PrivateKey); err != nil {
			return fmt.Errorf("failed to lookup tls private key file %s: %w", c.PrivateKey, err)
		}
	}

	if len(c.CertificateAuthority) > 0 {
		for _, ca := range c.CertificateAuthority {
			if _, err := os.Stat(ca); err != nil {
				return fmt.Errorf("failed to lookup tls certificate authority file %s: %w", ca, err)
			}
		}
	}

	return nil
}

func validPort(port string) error {
	if port == "" {
		return nil
	}

	p, err := strconv.Atoi(port)
	if err != nil {
		return fmt.Errorf("failed to convert port %s to an int", port)
	}

	const min int = 1
	const max int = 65535
	if p < min || p > max {
		return fmt.Errorf("port must be between %d and %d", min, max)
	}

	return nil
}

// validateURL returns an error if the given url fails to parse or
// if the given url's scheme is not found in the given schemes slice.
func validateURL(urlString string, schemes []string) error {
	if urlString == "" {
		return nil
	}

	u, err := url.Parse(urlString)
	if err != nil {
		return fmt.Errorf("failed to parse url %s: %w", urlString, err)
	}

	if u.Scheme == "" {
		return fmt.Errorf("scheme is not set: valid schemes are %v", schemes)
	}

	valid := false
	for _, scheme := range schemes {
		if u.Scheme == scheme {
			valid = true
			break
		}
	}
	if !valid {
		return fmt.Errorf("scheme %s is invalid: valid schemes are %v", u.Scheme, schemes)
	}

	return nil
}

func validateUUID(uuidString string) error {
	if uuidString == "" {
		return nil
	}

	_, err := uuid.Parse(uuidString)
	return err
}
