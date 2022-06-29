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
	"strconv"
	"strings"
)

// LatestVersionProvider provides the latest version string for an agent that matches version:latest
type LatestVersionProvider interface {
	LatestVersionString() string
}

// QueryToken represents a string in one of name:value, name=value, or just value. In the case of a value, the Name
// field of the QueryToken will be "". Name and Value will both be lowercase forms of the original text to simplify case
// insensitive matching.
type QueryToken struct {
	Original string
	Operator string
	Name     string
	Value    string
}

// IsNegated returns true if the token is negated
func (t *QueryToken) IsNegated() bool {
	return t.Operator == "-"
}

// Empty returns true if there is no name or value
func (t *QueryToken) Empty() bool {
	return t.Name == "" && t.Value == ""
}

// Query consists of a list of query tokens
type Query struct {
	Original string
	Tokens   []*QueryToken
}

// ParseQuery parses a query by splitting it into tokens
func ParseQuery(query string) *Query {
	tokens := []*QueryToken{}

	start := 0
	quote := '"'
	insideQuotes := false
	skip := false

	for i, c := range query {
		if skip {
			skip = false
			continue
		}
		switch c {
		case ' ':
			if insideQuotes {
				continue
			}
			if i > start {
				tokens = append(tokens, parseToken(query[start:i]))
			}
			start = i + 1
		case '\\':
			// escape character, skip next
			skip = true
		case '"':
			if insideQuotes {
				if quote == c {
					insideQuotes = false
				}
			} else {
				insideQuotes = true
				quote = c
			}
		}
	}

	remainder := query[start:]
	if remainder != "" {
		tokens = append(tokens, parseToken(remainder))
	} else if len(tokens) > 0 {
		// if the last part is an empty string, there is a trailing space and we want to add an extra empty token. if there is
		// just an empty string, we don't add an empty token.
		tokens = append(tokens, &QueryToken{})
	}

	return &Query{Original: query, Tokens: tokens}
}

// ReplaceVersionLatest allows us to support version:latest queries by replacing the keyword latest with the actual
// latest version.
func (q *Query) ReplaceVersionLatest(latestVersionProvider LatestVersionProvider) {
	for _, token := range q.Tokens {
		if token.Name == "version" && token.Value == "latest" {
			latest := latestVersionProvider.LatestVersionString()
			if latest != "" {
				token.Value = latest
			}
		}
	}
}

func stripQuotesAndDowncase(val string) string {
	val = stripQuotes(val)
	return strings.ToLower(val)
}
func stripQuotes(val string) string {
	s, err := strconv.Unquote(val)
	if err != nil {
		return val
	}
	return s
}

// parseToken parses a single QueryToken
func parseToken(token string) *QueryToken {
	stripped := stripQuotesAndDowncase(token)
	// split on colon
	parts := strings.SplitN(stripped, ":", 2)
	if len(parts) == 1 {
		// try splitting on equals
		parts = strings.SplitN(stripped, "=", 2)
	}
	if len(parts) == 2 {
		operator, name := parseOperator(parts[0])
		return &QueryToken{
			Original: token,
			Operator: operator,
			Name:     stripQuotes(name),
			Value:    stripQuotes(parts[1]),
		}
	}
	operator, value := parseOperator(stripped)
	return &QueryToken{
		Original: token,
		Operator: operator,
		Name:     "",
		Value:    stripQuotes(value),
	}
}

// parseOperator parses a +/- operator from the token and returns the operator and remainder
func parseOperator(token string) (operator, remainder string) {
	if token == "" {
		return "", ""
	}
	switch token[0] {
	case '+':
		return "+", token[1:]
	case '-':
		return "-", token[1:]
	default:
		return "", token
	}
}

// LastToken returns the last token of the Query or nil if there are no tokens in the query. The last token of a query
// is used for suggestions.
func (q *Query) LastToken() *QueryToken {
	if len(q.Tokens) == 0 {
		return nil
	}
	return q.Tokens[len(q.Tokens)-1]
}

// ApplySuggestion returns a complete query replacing the last token with the suggestion
func (q *Query) ApplySuggestion(s *Suggestion) string {
	var sb strings.Builder
	for i, token := range q.Tokens {
		if i == len(q.Tokens)-1 {
			_, _ = sb.WriteString(s.Query)
			if !strings.HasSuffix(s.Query, ":") {
				_, _ = sb.WriteRune(' ')
			}
		} else {
			_, _ = sb.WriteString(token.Original)
			_, _ = sb.WriteRune(' ')
		}
	}
	return sb.String()
}
