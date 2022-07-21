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

package server

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
	"golang.org/x/exp/slices"

	"github.com/observiq/bindplane-op/internal/eventbus"
	"github.com/observiq/bindplane-op/internal/server/livetail"
)

// ----------------------------------------------------------------------
// LiveTail endpoint

// AddLiveTailRoutes adds the routes used by opamp, currently /v1/opamp
func AddLiveTailRoutes(router gin.IRouter, bindplane BindPlane) error {
	relayer := NewRelayer(bindplane, bindplane.Logger())

	server := &liveTailServer{
		relayer:    relayer,
		wsUpgrader: websocket.Upgrader{},
		logger:     bindplane.Logger().Named("livetail"),
	}

	router.Any("/livetail", gin.WrapF(http.HandlerFunc(server.httpHandler)))

	bindplane.SetRelayer(relayer)

	return nil
}

type liveTailServer struct {
	relayer    Relayer
	wsUpgrader websocket.Upgrader
	logger     *zap.Logger
}

// borrowed and modified code from opamp for receiving websocket messages

func (s *liveTailServer) httpHandler(w http.ResponseWriter, req *http.Request) {
	// No, it is a WebSocket. Upgrade it.
	conn, err := s.wsUpgrader.Upgrade(w, req, nil)
	if err != nil {
		s.logger.Error("Cannot upgrade HTTP connection to WebSocket", zap.Error(err))
		return
	}

	// Return from this func to reduce memory usage.
	// Handle the connection on a separate goroutine.
	go s.handleWSConnection(conn)
}

func (s *liveTailServer) handleWSConnection(wsConn *websocket.Conn) {
	defer func() {
		// Close the connection when all is done.
		defer func() {
			err := wsConn.Close()
			if err != nil {
				s.logger.Error("error closing the WebSocket connection", zap.Error(err))
			}
		}()

		s.relayer.OnConnectionClose(wsConn)
	}()

	s.relayer.OnConnected(wsConn)

	// Loop until fail to read from the WebSocket connection.
	for {
		// Block until the next message can be read.
		mt, bytes, err := wsConn.ReadMessage()
		if err != nil {
			if !websocket.IsUnexpectedCloseError(err) {
				s.logger.Error("Cannot read a message from WebSocket", zap.Error(err))
				break
			}
			// This is a normal closing of the WebSocket connection.
			s.logger.Debug("Agent disconnected", zap.Error(err))
			break
		}
		if mt != websocket.TextMessage {
			s.logger.Error("Received unexpected message type from WebSocket", zap.Int("type", mt))
			continue
		}

		s.logger.Info("OnMessage", zap.String("message", string(bytes)))

		// Decode WebSocket message as a LiveTail message.
		var message livetail.Message
		err = json.Unmarshal(bytes, &message)
		if err != nil {
			s.logger.Error("Cannot decode message from WebSocket", zap.Error(err))
			continue
		}

		s.relayer.OnMessage(wsConn, &message)
	}
}

// ----------------------------------------------------------------------

// Relayer forwards livetail.messages received from the agent to GraphQL subscriptions
type Relayer interface {
	Messages() eventbus.Source[*livetail.Message]
	AddSubscription(ctx context.Context, sessionID string, agentIDs []string, filters []string)
	RemoveSubscription(ctx context.Context, sessionID string)

	OnConnected(wsConn *websocket.Conn)
	OnConnectionClose(wsConn *websocket.Conn)
	OnMessage(wsConn *websocket.Conn, message *livetail.Message)
}

type relayer struct {
	manager       Manager
	messages      eventbus.Source[*livetail.Message]
	subscriptions subscriptions
	endpoint      string
	logger        *zap.Logger
}

// NewRelayer creates a new relayer that can be used to subscribe to Live livetail.messages from Agents
func NewRelayer(bindplane BindPlane, logger *zap.Logger) Relayer {
	endpoint := fmt.Sprintf("%s/v1/livetail", bindplane.Config().WebsocketURL())
	return &relayer{
		manager:  bindplane.Manager(),
		endpoint: endpoint,
		subscriptions: subscriptions{
			configurations: map[string]*livetail.Configuration{},
		},
		messages: eventbus.NewSource[*livetail.Message](),
		logger:   logger.Named("Relayer"),
	}
}

func (r *relayer) OnConnected(wsConn *websocket.Conn) {
	r.logger.Info("OnConnected")
}
func (r *relayer) OnConnectionClose(wsConn *websocket.Conn) {
	r.logger.Info("OnConnectionClose")
}
func (r *relayer) OnMessage(wsConn *websocket.Conn, message *livetail.Message) {
	r.logger.Info("OnMessage", zap.Any("message", message))
	r.messages.Send(message)
}

func (r *relayer) Messages() eventbus.Source[*livetail.Message] {
	return r.messages
}

func (r *relayer) AddSubscription(ctx context.Context, sessionID string, agentIDs []string, filters []string) {
	r.logger.Info("AddSubscription", zap.String("sessionID", sessionID), zap.Strings("agentIDs", agentIDs), zap.Strings("filters", filters))
	for _, agentID := range agentIDs {
		c := r.subscriptions.upsertSubscription(agentID, func(config *livetail.Configuration) {
			config.Endpoint = r.endpoint
			config.Sessions = append(config.Sessions, livetail.Session{
				ID:      sessionID,
				Filters: filters,
			})
		})
		r.manager.ConfigureLiveTail(ctx, agentID, c)
	}
}

func (r *relayer) RemoveSubscription(ctx context.Context, sessionID string) {
	r.logger.Info("RemoveSubscription", zap.String("sessionID", sessionID))
	for agentID := range r.subscriptions.configurations {
		hadSessionID := false
		c := r.subscriptions.upsertSubscription(agentID, func(config *livetail.Configuration) {
			config.Endpoint = r.endpoint
			var newSessions []livetail.Session
			for _, session := range config.Sessions {
				if session.ID == sessionID {
					hadSessionID = true
					continue
				}
				newSessions = append(newSessions, session)
			}
			config.Sessions = newSessions
		})
		if hadSessionID {
			r.manager.ConfigureLiveTail(ctx, agentID, c)
		}
	}
}

func RelayLiveTailUntilDone[T any](ctx context.Context, relayer Relayer, agentIDs []string, filters []string, mapper func(*livetail.Message) T) (<-chan T, error) {
	// generate a new session id
	sessionID := uuid.NewString()

	// configure each agent "livetail" with a new session matching the filters
	relayer.AddSubscription(ctx, sessionID, agentIDs, filters)

	// subscribe with filter
	channel, _ := eventbus.SubscribeWithFilterUntilDone(ctx, relayer.Messages(), func(message *livetail.Message) (result T, accept bool) {
		// only accept message that apply to this session
		accept = slices.Contains(message.Sessions, sessionID)
		if accept {
			result = mapper(message)
		}
		return
	}, eventbus.WithUnsubscribeHook[T](func() {
		// configure each agent "livetail" to remove this session
		relayer.RemoveSubscription(ctx, sessionID)
	}))

	return channel, nil
}

// ----------------------------------------------------------------------

type subscriptions struct {
	configurations map[string]*livetail.Configuration
}

func (s *subscriptions) upsertSubscription(agentID string, updater func(*livetail.Configuration)) livetail.Configuration {
	c, ok := s.configurations[agentID]
	if !ok {
		c = &livetail.Configuration{}
		s.configurations[agentID] = c
	}
	updater(c)
	if c.Empty() {
		delete(s.configurations, agentID)
	}
	return *c
}
