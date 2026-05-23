# Real-Time Data Poller — JS Mastery Day 14

A production-grade real-time sensor monitoring system built in Node.js.
Polls multiple data sources, processes readings through a pipeline,
emits alerts on threshold breaches, and logs everything to a file.

## Structure

```
day-14-realtime-poller/
├── src/
│   ├── emitter.js
│   ├── logger.js
│   ├── pipeline.js
│   └── server.js
│
├── app.log
├── index.js
├── package.json
└── README.md
```

## Concepts Demonstrated
- Event-driven architecture with custom EventEmitter
- Async polling with retry logic and timeout wrapping
- Pure function data pipeline — validate, convert, tag
- File logging with fs/promises
- Raw HTTP server — no frameworks
- Graceful shutdown on SIGINT

## How to Run
node index.js

## Endpoints
GET /status — live stats (sources, polls, errors, uptime)
GET /health — { status: "ok" }

## Shutdown
Ctrl+C — stops poller, closes server, logs shutdown  
