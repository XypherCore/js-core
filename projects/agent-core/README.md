# agent-core

An event-driven autonomous agent framework for Node.js.

`agent-core` gives you a small Perception -> Decision -> Action loop with memory, logging, event hooks, rule priority, and cooldown support. You define what the agent can sense, how it decides, and what actions it can run.

Part of Ascension-X, Stage 1 Phase 3.

## Features

- Poll async perception sources on their own intervals.
- Store readings and agent state in persistent memory.
- Evaluate rule-based decisions with priority and cooldowns.
- Register named async actions and execute them from decisions.
- Emit lifecycle and cycle events from the core Agent.
- Write structured logs to a file.
- Run without external dependencies.

## Project Structure

```text
agent-core/
  src/
    agent.js       Core Agent class and lifecycle events
    perception.js  Polling data ingestion layer
    decision.js    Rule-based decision engine
    actions.js     Action registry and executor
    memory.js      State store with history and subscribers
    logger.js      Structured file logger
  index.js         Public API exports
  demo.js          Monitoring agent demo
```

## Installation

From this folder:

```bash
npm install
```

The package currently has no external runtime dependencies.

## Run The Demo

```bash
npm run demo
```

The demo creates a monitoring agent with:

- A temperature source that polls every 2 seconds.
- A load source that polls every 3 seconds.
- Rules for cooldown, scale-up, and idle states.
- Actions that update memory and write logs.
- Status output every 5 seconds.
- Automatic shutdown after 20 seconds.

Demo logs are written to `agent-demo.log`, which is ignored by git.

## Run Checks

```bash
npm test
```

This runs syntax checks against the public entry point, demo, and source modules.

## Quick Example

```js
import {
    Agent,
    createActionRegistry,
    createDecisionEngine,
    createMemory,
    createPerception
} from "./index.js";

const memory = createMemory({ alerted: false });

const perception = createPerception([
    {
        id: "temperature",
        interval: 1000,
        async fn() {
            return { value: 42, unit: "C" };
        }
    }
]);

const decisions = createDecisionEngine([
    {
        name: "temperature-too-high",
        action: "cooldown",
        priority: 10,
        cooldown: 5000,
        condition(perception) {
            const reading = perception.getLatest().temperature;
            return reading?.data.value > 35;
        }
    }
]);

const actions = createActionRegistry();

actions.register("cooldown", async (context, memory) => {
    memory.set("alerted", true);
    return { cooling: true };
});

const agent = new Agent({
    name: "example-agent",
    perception,
    decisions,
    actions,
    memory
});

agent.on("cycle", (cycle) => {
    console.log(cycle.decisions);
});

agent.start();
```

## Public API

```js
import {
    Agent,
    createActionRegistry,
    createDecisionEngine,
    createLogger,
    createMemory,
    createPerception
} from "./index.js";
```

### `createMemory(initialState)`

Creates a small state store.

- `get(key)` returns a value.
- `set(key, value)` updates a value and notifies subscribers.
- `delete(key)` removes a key.
- `getAll()` returns a shallow state snapshot.
- `subscribe(fn)` listens for changes and returns an unsubscribe function.
- `history(key)` returns the last 10 previous values for a key.
- `clear()` resets state to the initial state.

### `createPerception(sources)`

Creates a polling data ingestion layer.

Each source has:

```js
{
    id: "source-id",
    interval: 1000,
    async fn() {
        return "reading";
    }
}
```

Methods:

- `start()` begins polling all sources.
- `stop()` stops polling.
- `on("reading", listener)` receives `{ sourceId, data, timestamp }`.
- `on("error", listener)` receives `{ sourceId, error }`.
- `getLatest()` returns the latest reading per source.

### `createDecisionEngine(rules)`

Creates a rule engine.

Each rule has:

```js
{
    name: "rule-name",
    condition: (perception, memory) => true,
    action: "action-name",
    priority: 10,
    cooldown: 5000
}
```

Methods:

- `evaluate(perception, memory)` returns matching decisions.
- `getHistory()` returns the last 20 decisions.

### `createActionRegistry()`

Creates a registry for named action handlers.

- `register(name, fn)` registers an action and returns an unregister function.
- `execute(name, context, memory)` runs a registered action.
- `getRegistered()` returns registered action names.

### `Agent`

Coordinates perception, decisions, actions, and memory.

Constructor options:

```js
new Agent({
    name,
    perception,
    decisions,
    actions,
    memory,
    logger
});
```

Methods:

- `start()` starts perception and emits `started`.
- `stop()` stops perception and emits `stopped`.
- `getStatus()` returns name, uptime, cycle count, memory snapshot, and active decisions.

Events:

- `started`
- `cycle`
- `error`
- `stopped`

### `createLogger(logFile)`

Creates a structured file logger.

- `log(level, message)`
- `info(message, details)`
- `warn(message, details)`
- `error(message, details)`
- `getLogs()`
- `clearLogs()`
- `watchLogs(onChange)`

## Notes

- This project uses ES modules. Keep `"type": "module"` in `package.json`.
- The framework is intentionally small and dependency-free.
- Action handlers receive `(context, memory)`, where `context` is created by the matching decision.
