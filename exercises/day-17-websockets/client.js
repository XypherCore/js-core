// client.js
// - connects to ws://localhost:8080
// - sends a sensor reading every 2 seconds:
//   { sensorId: "S1", value: Math.random() * 100 }
// - logs all messages received from server
// - auto-reconnects on disconnect
// - runs for 20 seconds then closes

import { WebSocket } from "ws";
import { createMessage, MessageType } from "./protocol.js";

let ws;
let readingTimer;
let shouldReconnect = true;

function connect() {
    ws = new WebSocket("ws://localhost:8080");

    ws.on("open", () => {
        console.log("Connected");

        readingTimer = setInterval(() => {
            const data = {
                sensorId: "S1",
                value: Math.random() * 100
            };

            const message = createMessage(MessageType.SENSOR_READING, data);

            ws.send(JSON.stringify(message));
        }, 2000);
    });

    ws.on("message", (raw) => {
        console.log("Received:", raw.toString());
    });

    ws.on("close", () => {
        console.log("Disconnected");

        clearInterval(readingTimer);

        if (shouldReconnect) {
            setTimeout(() => {
                connect();
            }, 1000);
        }
    });

    ws.on("error", (err) => {
        console.error("WebSocket error:", err.message);
    });
}

connect();

setTimeout(() => {
    shouldReconnect = false;
    clearInterval(readingTimer);

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
    }

    console.log("Client stopped after 20 seconds");
}, 20000);