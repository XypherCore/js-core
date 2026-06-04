# js-core

Learning JavaScript the hard way — exercises, projects, and notes from focused study.
Part of **Ascension-X**, Stage 1, Phase 3 — Control & Interface Layer.

---

## What This Is

This repository documents a structured JavaScript curriculum built from scratch —
no bootcamp, no tutorials, no shortcuts. Every file was written by hand, every
concept earned through debugging and iteration.

The goal is not web development. JavaScript here is the **Control & Interface Layer**
of a larger system — async pipelines, event-driven agents, real-time networking,
and eventually aerospace-grade intelligent systems.

---

## Exercises

Each day targets one concept. One file, one focus.

| Day | Topic | Concept |
|-----|-------|---------|
| 01 | Scope & Closures | Execution context, lexical scope, closure mechanics, private state |
| 02 | `this` & Prototypes | Four rules of `this`, explicit binding, prototype chain, OOP without classes |
| 03 | Array & Object Mastery | `map`, `filter`, `reduce`, chaining, destructuring, spread/rest |
| 04 | Event Loop | Call stack, microtask queue, callback queue, async foundations |
| 05 | Promises | Promise states, `.then()` / `.catch()`, combinators, anti-patterns |
| 06 | Async / Await | `async`/`await`, try/catch, sequential vs parallel execution |
| 07 | Mini Project — Task Manager | WeakMap, IIFE module pattern, prototype OOP, async wiring |
| 08 | Async Patterns | Microtask queue deep dive, debounce, throttle, async worker queue |
| 09 | Promises Deep | Promise internals, `withTimeout`, cache with TTL, async poller |
| 10 | Functional Programming | Pure functions, immutability, `pipe`, `curry`, Maybe functor |
| 11 | Modules & Architecture | ES Modules, barrel files, architecture layers, factory pattern |
| 12 | Event-Driven Programming | EventEmitter from scratch, pub/sub, pipeline with events |
| 13 | Node.js Core | `fs`, `path`, `process`, streams, file watching, structured logging |
| 14 | Mini Project — Real-Time Poller | HTTP server, async pipeline, circuit breaker foundations, graceful shutdown |
| 15 | Functional Patterns | Railway oriented programming, Result type, functional state management, Redux pattern |
| 16 | Advanced Async | Circuit breaker, async state machine, backpressure, combining patterns |
| 17 | WebSockets | WS protocol, message routing, heartbeat, broadcast, auto-reconnect |
| 18 | Generators & Iterators | Iterator Protocol, Generator functions, Async generators |
| 19 | Proxy & Reflect | Function Proxy, Validation proxy, Handler traps |
| 20 | Memory & Performance | *coming* |
| 21 | Mini Project 3 | *coming* |

---

## Projects

Production-grade builds using everything from the exercises.
Each project is a standalone system — not a tutorial, not a toy.

| Project | Description | Status |
|---------|-------------|--------|
| `sentinel` | Real-time system monitor — WebSocket server, sensor clients, alerting, logging | *coming* |
| `dataflow` | Functional data pipeline library — composable transformers, Result type, async stages | *coming* |
| `agent-core` | Event-driven autonomous agent — reads data, makes decisions, executes actions | *coming* |

---

## Structure

```
js-core/
├── exercises/
│   ├── day-01/
│   ├── day-02/
│   ├── ...
│   └── day-21/
└── projects/
    ├── sentinel/
    ├── dataflow/
    └── agent-core/
```

---

## Stack

- **Runtime** — Node.js
- **Modules** — ES Modules throughout
- **Style** — No frameworks, no abstractions, raw JS
- **Tools** — VS Code, Git

---

*No shortcuts. No tutorials. Just code.*
