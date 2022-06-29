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
	"fmt"
	"strings"

	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

type flags struct {
	set *pflag.FlagSet
}

func newflags(set *pflag.FlagSet) *flags {
	return &flags{set: set}
}

func (s *flags) String(name string, value string, usage string, opts ...flagOption) {
	newflag(name, opts, withUsage(usage)).String(s.set, value)
}

func (s *flags) StringP(name string, shorthand string, value string, usage string, opts ...flagOption) {
	newflag(name, opts, withShorthand(shorthand), withUsage(usage)).String(s.set, value)
}

func (s *flags) StringSlice(name string, value []string, usage string, opts ...flagOption) {
	newflag(name, opts, withUsage(usage)).StringSlice(s.set, value)
}

func (s *flags) Bool(name string, value bool, usage string, opts ...flagOption) {
	newflag(name, opts, withUsage(usage)).Bool(s.set, value)
}

// ----------------------------------------------------------------------
type flag struct {
	name           string
	shorthand      string
	usage          string
	configFileName string
	envVarName     string
}

func newflag(name string, opts []flagOption, moreopts ...flagOption) *flag {
	f := &flag{
		name:           name,
		configFileName: asConfigFileName(name),
		envVarName:     asEnvVarName(name),
	}
	for _, opt := range opts {
		opt(f)
	}
	for _, opt := range moreopts {
		opt(f)
	}
	return f
}

func (f *flag) String(set *pflag.FlagSet, defaultValue string) {
	set.StringP(f.name, f.shorthand, defaultValue, f.usage)
	f.BindViper(set)
}

func (f *flag) StringSlice(set *pflag.FlagSet, defaultValue []string) {
	set.StringSliceP(f.name, f.shorthand, defaultValue, f.usage)
	f.BindViper(set)
}

func (f *flag) Bool(set *pflag.FlagSet, defaultValue bool) {
	set.BoolP(f.name, f.shorthand, defaultValue, f.usage)
	f.BindViper(set)
}

func (f *flag) BindViper(set *pflag.FlagSet) {
	// Bind flags to viper keys, ignoring errors because they will only be produced if the flags are nil,
	// which they wont be because we just set them above.
	_ = viper.BindPFlag(f.configFileName, set.Lookup(f.name))
	// Special handling for multi word cases, automatic env would just pick up "BINDPLANE_CONFIG_SERVERURL"
	// SetEnvPrefix is *supposed* to work with BindEnv, but I found I had to specify the prefix explicitly
	// Once again ignoring error because it will only trigger if the first argument is empty, which its not.
	_ = viper.BindEnv(f.configFileName, fmt.Sprintf("BINDPLANE_CONFIG_%s", f.envVarName))
}

// ----------------------------------------------------------------------

// flagOption modifies the flag
type flagOption func(*flag)

// withUsage specifies the usage of the flag
func withUsage(usage string) flagOption {
	return func(f *flag) {
		f.usage = usage
	}
}

// withShorthand specifies a shorthand version of the flag
func withShorthand(shorthand string) flagOption {
	return func(f *flag) {
		f.shorthand = shorthand
	}
}

// withConfigFileName uses a special config file name instead of the camel-case version of the provided name
func withConfigFileName(configFileName string) flagOption {
	return func(f *flag) {
		f.configFileName = configFileName
	}
}

// withEnvVarName uses a special environment variable name instead of the uppercase version of the provided name
func withEnvVarName(envVarName string) flagOption {
	return func(f *flag) {
		f.envVarName = envVarName
	}
}

// ----------------------------------------------------------------------

// asConfigFileName converts a flagName in kabob-case to a configFile name in camel-case. there is special handling
// for -url which becomes all caps URL.
func asConfigFileName(flagName string) string {
	// special handling for -url
	flagName = strings.ReplaceAll(flagName, "-url", "URL")

	var sb strings.Builder
	sb.Grow(len(flagName))
	makeUpper := false
	for _, c := range flagName {
		switch c {
		case '-':
			makeUpper = true
		default:
			if makeUpper {
				sb.WriteString(strings.ToUpper(string(c)))
				makeUpper = false
			} else {
				sb.WriteRune(c)
			}
		}
	}
	return sb.String()
}

// asEnvVarName converts a flagName in kabob-case to an environment variable name in uppercase snake case
func asEnvVarName(flagName string) string {
	return strings.ToUpper(strings.ReplaceAll(flagName, "-", "_"))
}
