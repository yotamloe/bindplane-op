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

package eventbus

import (
	"context"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

type testSubscriber struct {
	channel <-chan int
	ctx     context.Context
	total   int32
}

func newTestSubscriber(ctx context.Context) *testSubscriber {
	return &testSubscriber{
		ctx: ctx,
	}
}

func (s *testSubscriber) Subscribe(source Source[int]) UnsubscribeFunc {
	channel, unsubscribe := Subscribe(source)
	s.channel = channel
	return unsubscribe
}

func (s *testSubscriber) SubscribeWithFilter(source Source[int], filter func(int) (int, bool)) UnsubscribeFunc {
	channel, unsubscribe := SubscribeWithFilter(source, filter)
	s.channel = channel
	return unsubscribe
}

func (s *testSubscriber) SubscribeUntilDone(ctx context.Context, source Source[int]) UnsubscribeFunc {
	channel, unsubscribe := SubscribeUntilDone(ctx, source)
	s.channel = channel
	return unsubscribe
}

func (s *testSubscriber) run() {
	for {
		select {
		case num, ok := <-s.channel:
			if ok {
				atomic.AddInt32(&s.total, int32(num))
			}
		case <-s.ctx.Done():
			return
		}
	}
}

func (s *testSubscriber) requireTotal(t *testing.T, value int) {
	require.Eventuallyf(t, func() bool { return atomic.LoadInt32(&s.total) == int32(value) }, time.Second, 10*time.Millisecond, "total should be %d, not %d, %v", int32(value), atomic.LoadInt32(&s.total), atomic.LoadInt32(&s.total) == int32(value))
}

func TestEventBus(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	bus := NewSource[int]()

	// no subscribers, this will be ignored
	bus.Send(1)

	s1 := newTestSubscriber(ctx)
	unsubscribe1 := s1.Subscribe(bus)
	go s1.run()

	// subscriber will increment by 1
	bus.Send(1)
	s1.requireTotal(t, 1)

	require.Equal(t, 1, bus.Subscribers())

	s2 := newTestSubscriber(ctx)
	unsubscribe2 := s2.Subscribe(bus)
	go s2.run()

	bus.Send(1)
	bus.Send(1)
	s1.requireTotal(t, 3)
	s2.requireTotal(t, 2)

	require.Equal(t, 2, bus.Subscribers())

	unsubscribe1()

	require.Equal(t, 1, bus.Subscribers())

	bus.Send(1)
	s1.requireTotal(t, 3)
	s2.requireTotal(t, 3)

	unsubscribe2()

	require.Equal(t, 0, bus.Subscribers())

	bus.Send(1)
	s1.requireTotal(t, 3)
	s2.requireTotal(t, 3)

	cancel()
}

func TestEventBusWithFilter(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	bus := NewSource[int]()

	// no subscribers, this will be ignored
	bus.Send(1)

	s1 := newTestSubscriber(ctx)
	unsubscribe1 := s1.SubscribeWithFilter(bus, func(val int) (int, bool) {
		switch val {
		case 1:
			return 2, true
		case 2:
			return val, false
		default:
			return val, true
		}
	})
	go s1.run()

	// subscriber with filter will increment by 2
	bus.Send(1)
	s1.requireTotal(t, 2)

	require.Equal(t, 1, bus.Subscribers())

	bus.Send(2)
	s1.requireTotal(t, 2)
	bus.Send(3)

	unsubscribe1()

	bus.Send(1)
	s1.requireTotal(t, 5)

	cancel()
}

func TestEventBusSubscribeUntilDone(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	bus := NewSource[int]()
	bus.Send(1)

	subCtx, subCancel := context.WithCancel(context.Background())

	s1 := newTestSubscriber(ctx)
	_ = s1.SubscribeUntilDone(subCtx, bus)
	go s1.run()

	bus.Send(1)
	s1.requireTotal(t, 1)

	bus.Send(1)
	s1.requireTotal(t, 2)

	// cancel should end the subscription
	subCancel()

	// eventually the subscriber should be gone
	require.Eventually(t, func() bool { return bus.Subscribers() == 0 }, time.Second, 10*time.Millisecond)

	bus.Send(1)
	s1.requireTotal(t, 2)

	cancel()
}
