package livetail

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"

	"github.com/observiq/bindplane-op/internal/server"
)

// AddRoutes adds the routes used by opamp, currently /v1/opamp
func AddRoutes(router gin.IRouter, bindplane server.BindPlane) error {
	server := &liveTailServer{
		wsUpgrader: websocket.Upgrader{},
		logger:     bindplane.Logger().Named("livetail"),
	}

	router.Any("/livetail", gin.WrapF(http.HandlerFunc(server.httpHandler)))

	return nil
}

type liveTailServer struct {
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
	conn := connection{
		wsConn: wsConn,
		logger: s.logger,
	}

	defer func() {
		// Close the connection when all is done.
		defer func() {
			err := wsConn.Close()
			if err != nil {
				s.logger.Error("error closing the WebSocket connection", zap.Error(err))
			}
		}()

		conn.OnConnectionClose()
	}()

	conn.OnConnected()

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

		// Decode WebSocket message as a LiveTail message.
		var message message
		err = json.Unmarshal(bytes, &message)
		if err != nil {
			s.logger.Error("Cannot decode message from WebSocket", zap.Error(err))
			continue
		}

		conn.OnMessage(&message)
	}
}
