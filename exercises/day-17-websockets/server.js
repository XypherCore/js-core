// server.js
// - WebSocket server on port 8080
// - MessageRouter handles:
//   "sensor:reading" → broadcast to all other clients
//   "heartbeat"      → respond with ack
// - tracks connected clients with ids
// - logs all readings with timestamp
// - setupHeartbeat every 10 seconds

import { WebSocketServer, WebSocket } from "ws";
import { createMessage, parseMessage, MessageType } from "./protocol.js";

const wss = new WebSocketServer({ port: 8080 });

let nextClientId = 1;

wss.on("connection", (ws) => {
    ws.id = nextClientId++;
    ws.isAlive = true;

    console.log(`Client ${ws.id} connected`);

    ws.on("message", (raw) => {
        const result = parseMessage(raw);

        if (!result.ok) {
            ws.send(JSON.stringify(createMessage(MessageType.ERROR, {
                error: result.error
            })));
            return;
        }

        const message = result.message;

        if (message.type === MessageType.SENSOR_READING) {
            console.log(`[${message.timestamp}] Client ${ws.id}:`, message.payload);

            for (const client of wss.clients) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            }

            return;
        }

        if (message.type === MessageType.HEARTBEAT) {
            ws.isAlive = true;

            ws.send(JSON.stringify(createMessage(MessageType.ACK, {
                clientId: ws.id,
                receivedId: message.id
            })));

            return;
        }

        ws.send(JSON.stringify(createMessage(MessageType.ERROR, {
            error: `Unknown message type: ${message.type}`
        })));
    });

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("close", () => {
        console.log(`Client ${ws.id} disconnected`);
    });
});

function setupHeartbeat() {
    setInterval(() => {
        for (const client of wss.clients) {
            if (!client.isAlive) {
                console.log(`Client ${client.id} failed heartbeat`);
                client.terminate();
                continue;
            }

            client.isAlive = false;
            client.ping();
        }
    }, 10000);
}

setupHeartbeat();

console.log("WebSocket server running on ws://localhost:8080");