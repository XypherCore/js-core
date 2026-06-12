# pipeline-core — JS Mastery Day 21

A reusable intelligent data pipeline engine built from scratch.
Composable transforms, Result-based error handling, Observable streams.
Week 3 capstone — everything from Days 15–20 in one system.

## Structure

```
day-21-pipeline-core/
├── src/
│   ├── observable.js
│   ├── pipeline.js
│   ├── pool.js 
│   ├── result.js 
│   └── transforms.js
│
├── demo.js
├── index.js
├── package.json
└── README.md
```

## Concepts Demonstrated
- Railway oriented programming — Result type, errors flow not explode
- Observable pattern — fromArray, fromAsync, fromGenerator
- Pure function transforms — composable, testable, no side effects
- Pipeline engine — source → transforms → sink
- Object pooling — reuse over allocate
- Functional composition — pipe chains Result-returning transforms

## How to Run
node demo.js

## API
import { Pipeline, Observable, Result, transforms } from "./index.js";

new Pipeline({ onError: console.error })
  .source(observable)
  .transform(validate(schema), normalize(fields, min, max), tag(rules))
  .sink(item => console.log(item))
  .run()
  .then(stats => console.log(stats));