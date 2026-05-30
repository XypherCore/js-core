# WebSocket Sensor Broadcast - JS Mastery Day 17

A small real-time sensor broadcast system built with Node.js and WebSockets. Clients simulate sensor readings and send them to a WebSocket server. The server logs each reading and broadcasts it to every other connected client.

This exercise focuses on practical WebSocket patterns: persistent connections, message routing, broadcast behavior, heartbeat checks, reconnect handling, and clean client shutdown.

## Project Structure

```text
day-17-websockets/
  server.js     WebSocket server with routing, broadcast, and heartbeat checks
  client.js     Sensor client that sends readings and reconnects on disconnect
  protocol.js   Shared message types, message factory, and parser
  package.json  Node.js module configuration and dependencies
```

## Features

- WebSocket server running on `ws://localhost:8080`
- Sensor clients that send readings every 2 seconds
- Shared protocol helpers for consistent message creation and parsing
- Broadcast of sensor readings to all clients except the sender
- Server-side heartbeat checks every 10 seconds
- Client-side reconnect after disconnect
- Client shutdown after 20 seconds
- Basic error responses for invalid or unknown messages

## Message Protocol

Messages are JSON objects with a consistent shape:

```js
{
    id: 123456789,
    type: "sensor:reading",
    payload: {},
    timestamp: "2026-05-30T12:00:00.000Z"
}
```

Supported message types:

- `sensor:reading` - sent by clients when new sensor data is available
- `heartbeat` - sent by clients when checking server availability
- `ack` - sent by the server to acknowledge heartbeat messages
- `error` - sent by the server when a message is invalid or unsupported

## Setup

Install dependencies from this directory:

```bash
npm install
```

## Running the Demo

Start the server in one terminal:

```bash
node server.js
```

Start one or more clients in separate terminals:

```bash
node client.js
```

Run multiple clients to observe broadcast behavior. When one client sends a sensor reading, the server logs it and forwards it to the other connected clients.

## Expected Behavior

- The server logs when clients connect and disconnect.
- Each client sends a random sensor value every 2 seconds.
- Sensor readings are broadcast to other connected clients.
- The client logs messages received from the server.
- If a client disconnects before the 20-second shutdown, it attempts to reconnect.
- After 20 seconds, the client stops sending readings and closes the connection.
