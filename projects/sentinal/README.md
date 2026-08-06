# sentinel

Real-time system monitor built in Node.js.
Polls CPU, memory, and network metrics, detects anomalies,
fires alerts, logs everything to file, and exposes a live HTTP + WebSocket API.

Part of **Ascension-X** — Stage 1, Phase 3 projects.

## Structure
sentinel/
  src/
    metrics.js    — simulated system metric generators
    monitor.js    — core polling engine, extends EventEmitter
    alerting.js   — rule-based alert engine with cooldown
    logger.js     — file-based structured logger
    server.js     — HTTP status API + WebSocket broadcast
  index.js        — entry point, wires everything together

## Features
- Real-time metric polling at configurable intervals
- Rule-based alerting — warning and critical thresholds
- Alert cooldown — no duplicate alerts within cooldown window
- Structured file logging — INFO, WARN, ERROR levels
- HTTP API — /status, /health, /alerts
- WebSocket — live metric and alert broadcast to connected clients
- Graceful shutdown on SIGINT

## How to Run
npm install
node index.js

## Endpoints
GET /status   — full system snapshot
GET /health   — { status: "ok" }
GET /alerts   — active alerts only

WebSocket: ws://localhost:3000
Messages: { type: "metric" | "alert", data, timestamp }

## Stack
Node.js · ws · ES Modules