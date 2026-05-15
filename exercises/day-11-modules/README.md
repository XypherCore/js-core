# Modular Task Manager — JS Mastery Day 11

A refactored version of the Day 7 Task Manager, rebuilt with a proper module architecture.

## Structure
day-11-modules/
src/
core/task.js        — pure functions: createTask, validateTask, isOverdue
services/storage.js — async simulated file I/O
services/scheduler.js — auto-save with setInterval
utils/delay.js      — delay utility
utils/id.js         — id generation
config/index.js     — constants
index.js              — entry point

## Concepts Demonstrated
- ES Modules: import/export
- Architecture layers: core, services, utils, config
- Pure functions separated from async operations
- Factory and singleton patterns
- Closure-based scheduler with stop control

## How to Run
node index.js