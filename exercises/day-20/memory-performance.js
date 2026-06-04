// Day 20 — Memory Management & Performance


// 1. Implement ObjectPool class
//    - constructor(factory, reset, initialSize)
//    - acquire() — get object from pool or create new
//    - release(obj) — return to pool after reset
//    - get size() — current pool size
//    - get totalCreated — track how many objects were ever created

class ObjectPool {
    constructor(factory, reset, initialSize) {
        this.factory = factory;
        this.reset = reset;
        this.pool = Array.from({ length: initialSize }, factory);
        this._totalCreated = initialSize;
    }

    acquire() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        const obj = this.factory();
        this._totalCreated++;
        return obj;
    }

    release(obj) {
        this.reset(obj);
        this.pool.push(obj);
    }

    get size() {
        return this.pool.length;
    }

    get totalCreated() {
        return this._totalCreated;
    }
}


// 2. Implement createLeakSafeEmitter()
//    - Returns an EventEmitter-like object
//    - on(event, listener) — register listener
//    - off(event, listener) — remove listener
//    - emit(event, ...args) — fire listeners
//    - destroy() — removes ALL listeners, clears all timers
//    - Tracks all setInterval/setTimeout calls internally
//      so destroy() can clear them automatically
//    - Returns a weakRef-based subscription so listeners
//      are automatically removed if the subscriber is GC'd

function createLeakSafeEmitter() {
    const listeners = new Map();
    const timers = new Set();

    return {
        on(event, listener) {
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }

            listeners.get(event).add(listener);

            return {
                unsubscribe: () => {
                    listeners.get(event)?.delete(listener);
                }
            };
        },

        off(event, listener) {
            listeners.get(event)?.delete(listener);
        },

        emit(event, ...args) {
            for (const listener of listeners.get(event) ?? []) {
                listener(...args);
            }
        },
        
        setTimeout(fn, delay) {
            let timer;
            const id = globalThis.setTimeout(() => {
                timers.delete(timer);
                fn();
            }, delay);

            timer = { type: "timeout", id }
            timers.add(timer);

            return id;
        },

        setInterval(fn, delay) {
            const id = globalThis.setInterval(fn, delay);
            const timer = { type: "interval", id };

            timers.add(timer);

            return id;
        },

        destroy() {
            listeners.clear();

            for (const timer of timers) {
                if (timer.type === "timeout") {
                    clearTimeout(timer.id);
                } else {
                    clearInterval(timer.id);
                }
            }

            timers.clear();
        }
    };
}


// 3. Implement benchmark(name, fn, iterations)
//    - runs fn iterations times
//    - returns { name, avg, min, max, total } in ms
//    - use it to compare:
//      a) string concat with +=
//      b) array push + join
//    for building a string of 10000 items
//    print the comparison

function benchmark(name, fn, iterations) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();

        fn();

        const end = performance.now();
        times.push(end - start);
    }

    const total = times.reduce((sum, time) => sum + time, 0);
    const avg = total / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);


    return {
        name,
        avg,
        min,
        max,
        total
    }
}

function buildWithConcat() {
    let result = "";

    for (let i = 0; i < 10000; i++) {
        result += i;
    }

    return result;
}

function buildWithJoin() {
    const parts = [];

    for (let i = 0; i < 10000; i++) {
        parts.push(i);
    }

    return parts.join("");
}


// Example:
// console.log(benchmark("concat", buildWithConcat, 100));
// console.log(benchmark("join", buildWithJoin, 100));