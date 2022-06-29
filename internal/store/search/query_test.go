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

package search

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestParseQuery(t *testing.T) {
	tests := []struct {
		query  string
		expect []*QueryToken
	}{
		{
			query:  "",
			expect: []*QueryToken{},
		},
		{
			query: "+foo:bar -bar:baz something else",
			expect: []*QueryToken{
				{
					Original: "+foo:bar",
					Operator: "+",
					Name:     "foo",
					Value:    "bar",
				},
				{
					Original: "-bar:baz",
					Operator: "-",
					Name:     "bar",
					Value:    "baz",
				},
				{
					Original: "something",
					Operator: "",
					Name:     "",
					Value:    "something",
				},
				{
					Original: "else",
					Operator: "",
					Name:     "",
					Value:    "else",
				},
			},
		},
		{
			query: `+foo:"ba baz" "something else" "it\"s fun"`,
			expect: []*QueryToken{
				{
					Original: `+foo:"ba baz"`,
					Operator: "+",
					Name:     "foo",
					Value:    "ba baz",
				},
				{
					Original: `"something else"`,
					Operator: "",
					Name:     "",
					Value:    "something else",
				},
				{
					Original: `"it\"s fun"`,
					Operator: "",
					Name:     "",
					Value:    `it"s fun`,
				},
			},
		},
		{
			// tests quotes around the entire token
			query: `"+foo:ba baz" "-foo:bar's"`,
			expect: []*QueryToken{
				{
					Original: `"+foo:ba baz"`,
					Operator: "+",
					Name:     "foo",
					Value:    "ba baz",
				},
				{
					Original: `"-foo:bar's"`,
					Operator: "-",
					Name:     "foo",
					Value:    "bar's",
				},
			},
		},
		{
			query: "trailing space ",
			expect: []*QueryToken{
				{
					Original: "trailing",
					Operator: "",
					Name:     "",
					Value:    "trailing",
				},
				{
					Original: "space",
					Operator: "",
					Name:     "",
					Value:    "space",
				},
				{
					Original: "",
					Operator: "",
					Name:     "",
					Value:    "",
				},
			},
		},
	}
	for _, test := range tests {
		q := ParseQuery(test.query)
		require.ElementsMatch(t, test.expect, q.Tokens)
	}
}

func TestParseToken(t *testing.T) {
	tests := []struct {
		token  string
		expect QueryToken // expect omits Original but we still test for it
	}{
		{
			token: "+foo:bar",
			expect: QueryToken{
				Operator: "+",
				Name:     "foo",
				Value:    "bar",
			},
		},
		{
			token: "-foo:bar",
			expect: QueryToken{
				Operator: "-",
				Name:     "foo",
				Value:    "bar",
			},
		},
		{
			token: "foo:bar",
			expect: QueryToken{
				Operator: "",
				Name:     "foo",
				Value:    "bar",
			},
		},
		{
			token: "foo",
			expect: QueryToken{
				Operator: "",
				Name:     "",
				Value:    "foo",
			},
		},
		{
			token: "foo:",
			expect: QueryToken{
				Operator: "",
				Name:     "foo",
				Value:    "",
			},
		},
		{
			token: "-foo:",
			expect: QueryToken{
				Operator: "-",
				Name:     "foo",
				Value:    "",
			},
		},
		{
			token: "",
			expect: QueryToken{
				Operator: "",
				Name:     "",
				Value:    "",
			},
		},
	}

	for _, test := range tests {
		t.Run(test.token, func(t *testing.T) {
			token := parseToken(test.token)
			require.Equal(t, test.token, token.Original)
			require.Equal(t, test.expect.Operator, token.Operator)
			require.Equal(t, test.expect.Name, token.Name)
			require.Equal(t, test.expect.Value, token.Value)
		})
	}
}

type testLatestVersionProvider struct {
	version string
}

func (v *testLatestVersionProvider) LatestVersionString() string {
	return v.version
}

func TestQueryReplaceVersion(t *testing.T) {
	latestVersionProvider := &testLatestVersionProvider{"18.9"}

	tests := []struct {
		query  string
		expect string
	}{
		{
			query:  "+version:latest",
			expect: "+version:18.9",
		},
		{
			query:  "os:mac version:latest id:6",
			expect: "os:mac version:18.9 id:6",
		},
		{
			query:  "+version:18.5",
			expect: "+version:18.5",
		},
		{
			query:  "-version:latest",
			expect: "-version:18.9",
		},
		{
			query:  "os:mac",
			expect: "os:mac",
		},
	}

	for _, test := range tests {
		t.Run(test.query, func(t *testing.T) {
			q := ParseQuery(test.query)
			q.ReplaceVersionLatest(latestVersionProvider)
			require.Equal(t, test.expect, q.testCombinedTokens())
		})
	}
}

func (q *Query) testCombinedTokens() string {
	var sb strings.Builder
	for i, token := range q.Tokens {
		_, _ = sb.WriteString(token.Operator)
		_, _ = sb.WriteString(token.Name)
		_, _ = sb.WriteRune(':')
		_, _ = sb.WriteString(token.Value)
		if i != len(q.Tokens)-1 {
			_, _ = sb.WriteRune(' ')
		}
	}
	return sb.String()
}
