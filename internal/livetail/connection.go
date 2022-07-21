package livetail

import (
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

type connection struct {
	wsConn *websocket.Conn
	logger *zap.Logger
}

func (c *connection) OnConnected() {
	c.logger.Info("OnConnected")
}

func (c *connection) OnMessage(msg *message) {
	c.logger.Info("OnMessage", zap.Any("message", msg))
}

func (c *connection) OnConnectionClose() {
	c.logger.Info("OnConnectionClose")
}

func (c *connection) Close() {
	c.wsConn.Close()
}
