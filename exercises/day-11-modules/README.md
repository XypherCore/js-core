# Modular Task Manager — JS Mastery Day 11

A refactored version of the Day 7 Task Manager, rebuilt with a proper module architecture.

## Structure

```
day-11-modules/
├── src/
│   ├── config/
│   │   └── index.js
│   │
│   ├── core/
│   │   └── task.js
│   │
│   ├── services/
│   │   ├── scheduler.js
│   │   └── storage.js
│   │
│   └── utils/
│       ├── delay.js
│       └── id.js
│
├── README.md
├── index.js
└── package.json
```

## Concepts Demonstrated
- ES Modules: import/export
- Architecture layers: core, services, utils, config
- Pure functions separated from async operations
- Factory and singleton patterns
- Closure-based scheduler with stop control

## How to Run
node index.js
