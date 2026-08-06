// HTTP + WebSocket status server
//
// createServer(monitor, port)
//
// HTTP routes:
//   GET /status    → { uptime, totalReadings, activeAlerts, latest }
//   GET /health    → { status: "ok", timestamp }
//   GET /alerts    → array of currently active alerts
//
// WebSocket:
//   on "metric" event from monitor → broadcast to all WS clients
//   on "alert" event from monitor  → broadcast to all WS clients
//   message format: { type: "metric" | "alert", data, timestamp }
//
// Returns { start(), stop() }
//
// Use the ws library for WebSocket
// Import monitor events directly — server listens to monitor

import http, { ServerResponse } from "node:http";
import { WebSocketServer, WebSocket } from "ws";

export function createServer(monitor, port = 3000) {
    const server = http.createServer((req, res) => {
        if (req.method !== "GET") {
            sendJson(res, 405, { error: "Method not allowed" });
            return;
        }

        if (req.url === "/health") {
            sendJson(res, 200, {
                status: "ok",
                timestamp: new Date().toISOString()
            });
            return;
        }

        if (req.url === "/status") {
            sendJson(res, 200, monitor.getSnapshot());
            return;
        }

        if (req.url === "/alerts") {
            sendJson(res, 200, monitor.getSnapshot().activeAlerts);
            return;
        }

        sendJson(res, 404, { error: "Not found" });
    });

    const wss = new WebSocketServer({ server });

    function broadcast(type, data) {
        const message = JSON.stringify({
            type,
            data,
            timestamp: new Date().toISOString()
        });

        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }

    function handleMetric(metric) {
        broadcast("metric", metric);
    }

    function handleAlert(alert) {
        broadcast("alert", alert);
    }

    monitor.on("metric", handleMetric);
    monitor.on("alert", handleAlert);

    function start() {
        server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

        return server;
    }

    function stop() {
        monitor.off("metric", handleMetric);
        monitor.off("alert", handleAlert);

        for (const client of wss.clients) {
            client.close();
        }

        wss.close();
        server.close();
    }

    return {
        start,
        stop
    };
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data, null, 2));
}