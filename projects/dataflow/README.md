# Dataflow

A functional data pipeline library for Node.js.

Dataflow provides composable transforms, Result-based error handling, async iterable support, and stream helpers for building small data processing pipelines.

Part of **Ascension-X** - Stage 1, Phase 3 projects.

## Features

- Pipeline API for arrays, generators, and async iterables
- Railway-oriented `Result` handling for success, failure, skip, and stop states
- Curried built-in transforms for validation, mapping, filtering, batching, and projection
- Async stream utilities for intervals, WebSocket messages, merging, and throttling
- Output helpers for arrays, side effects, reductions, JSONL files, and run stats

## Project Structure

```text
dataflow/
  src/
    result.js      Result type for pipeline control flow
    transforms.js  Built-in composable transform functions
    pipeline.js    Pipeline class for processing iterable data
    stream.js      Async stream utility functions
  index.js         Public API exports
  demo.js          Three working demos
  package.json     Project metadata and scripts
```

## Quick Start

```bash
cd projects/dataflow
npm install
npm run demo
```

## Usage

```js
import { Pipeline, transforms } from "./index.js";

const { validate, normalize, tag, project } = transforms;

const results = await Pipeline
    .from(data)
    .pipe(
        validate(schema),
        normalize(0, 100, "value"),
        tag(rules),
        project(["id", "value", "tags"])
    )
    .toArray();
```

## Pipeline API

| Method | Description |
| --- | --- |
| `Pipeline.from(data)` | Creates a pipeline from an array, generator, or async iterable. |
| `.pipe(...transforms)` | Adds Result-returning transform functions. |
| `.toArray()` | Runs the pipeline and returns successful values. |
| `.forEach(fn)` | Runs the pipeline and calls `fn` for each successful value. |
| `.reduce(fn, initial)` | Runs the pipeline and reduces successful values. |
| `.toFile(path)` | Writes each successful value as a JSON line. |
| `.stats()` | Returns `{ processed, errors, duration }` from the latest run. |

## Built-In Transforms

| Transform | Purpose |
| --- | --- |
| `map(fn)` | Maps each item to a new value. |
| `filter(pred)` | Keeps items that match a predicate and skips the rest. |
| `validate(schema)` | Validates required fields, types, min values, and max values. |
| `normalize(min, max, field)` | Normalizes a numeric field to a 0-100 range. |
| `tag(rules)` | Adds a `tags` array based on matching rules. |
| `project(fields)` | Keeps only selected fields. |
| `limit(n)` | Allows the first `n` items, then stops the pipeline. |
| `dedupe(keyFn)` | Skips duplicate items based on a computed key. |
| `batch(size)` | Emits arrays of `size` items. |

## Stream Utilities

| Utility | Description |
| --- | --- |
| `fromInterval(fn, ms)` | Calls `fn` every `ms` milliseconds and yields each result. |
| `fromWebSocket(ws)` | Converts WebSocket messages into an async iterable. |
| `merge(...iterables)` | Merges multiple async iterables into one stream. |
| `throttle(iterable, ms)` | Limits emission rate to one item per `ms` milliseconds. |

## Demos

`demo.js` includes:

1. **Demo 1: Array Pipeline** - validates, dedupes, filters, normalizes, tags, and projects sensor readings.
2. **Demo 2: Generator Pipeline** - consumes an infinite Fibonacci generator safely with `limit`.
3. **Demo 3: Async Stream** - generates async readings with `fromInterval` and processes them through a pipeline.

Run all demos with:

```bash
npm run demo
```
