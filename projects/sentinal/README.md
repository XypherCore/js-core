# Sentinal

A real-time system monitor built with Node.js.

Sentinal polls CPU, memory, and network metrics, detects anomalies with rule-based alerts, writes structured logs, and exposes a live HTTP and WebSocket API.

Part of **Ascension-X** - Stage 1, Phase 3 projects.

## Features

- Real-time metric polling at configurable intervals
- CPU and memory readings from Node's `os` module
- Simulated network throughput readings
- Rule-based warning and critical alerts
- Alert cooldowns to avoid duplicate alert noise
- Structured file logging with `INFO`, `WARN`, and `ERROR` levels
- HTTP status API for health, alerts, and full monitor snapshots
- WebSocket broadcast for live metrics and alerts
- Graceful shutdown on `SIGINT`

## Project Structure

```text
sentinal/
  src/
    metrics.js    CPU, memory, and network metric generators
    monitor.js    Core polling engine with EventEmitter-style events
    alerting.js   Rule-based alert engine with cooldown support
    logger.js     File-based structured logger
    server.js     HTTP status API and WebSocket broadcaster
  index.js        Entry point that wires the monitor, alerts, logs, and server
  package.json    Project metadata and dependencies
```

## Quick Start

```bash
cd projects/sentinal
npm install
node index.js
```

The server starts on:

```text
http://localhost:3000
```

Logs are written to:

```text
sentinal.log
```

## HTTP API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Returns service health and a timestamp. |
| `GET` | `/status` | Returns uptime, total readings, active alerts, and latest metrics. |
| `GET` | `/alerts` | Returns currently active alerts. |

Example:

```bash
curl http://localhost:3000/status
```

## WebSocket API

Connect to:

```text
ws://localhost:3000
```

Messages are broadcast as JSON:

```json
{
  "type": "metric",
  "data": {
    "type": "cpu",
    "value": 42.5,
    "unit": "%",
    "timestamp": "2026-08-12T00:00:00.000Z"
  },
  "timestamp": "2026-08-12T00:00:00.000Z"
}
```

The `type` field is either:

- `metric`
- `alert`

## Alert Rules

Default alert rules include:

| Rule | Metric | Severity | Condition |
| --- | --- | --- | --- |
| High CPU usage | `cpu` | `warning` | `value >= 85` |
| Critical CPU usage | `cpu` | `critical` | `value >= 95` |
| High memory usage | `memory` | `warning` | `value >= 80` |
| Critical memory usage | `memory` | `critical` | `value >= 92` |
| Network burst | `network` | `warning` | `value >= 750` |

## Stack

- Node.js
- ES Modules
- `ws` for WebSocket support
