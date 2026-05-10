// Day 9 — Promises Deep Dive & Advanced Async Patterns

// EXERCISES:----

// 1. withTimeout(promise, ms)
//    - wraps any promise with a timeout
//    - rejects with "Timed out after Xms" if it takes too long
//    - if promise resolves before timeout, cancel the timer

function withTimeout(promise, ms) {
    let timerId;

    const timeoutPromise = new Promise((resolve, reject) => {
        timerId = setTimeout(() => {
            reject(`Timed out after ${ms}ms`)
        }, ms)
    });

    return Promise.race([promise, timeoutPromise])
        .finally(() => {
            clearTimeout(timerId);
        });
}


// 2. createCache(ttl)
//    - implement exactly as shown below
//    - add a .size getter that returns number of cached entries
//    - add a .has(key) method that returns true only if key exists AND is fresh

function createCache(ttl) {
    //implementation
    const cache = new Map();

    return {
        async get(key, fetchFn) {
            const cached = cache.get(key);
            const now = Date.now();

            if (cached && now - cached.timestamp < ttl) {
                return cached.value; // return cached if fresh
            }

            const value = await fetchFn(); // fetch fresh data
            cache.set(key, { value, timestamp: Date.now() });
            return value;
        },
        invalidate(key) {
            cache.delete(key);
        },
        clear() {
            cache.clear();
        },

        // solution
        get size() {
            return cache.size
        },
        has(key) {
            const cached = cache.get(key);
            const now = Date.now();

            return Boolean(cached && now - cached.timestamp < ttl);
        }
    };
}


// 3. asyncPoller(fn, intervalMs, stopCondition)
//    - calls fn every intervalMs milliseconds
//    - fn is async and returns a value
//    - stopCondition is a function that takes the result and returns true/false
//    - stops polling when stopCondition returns true
//    - returns the final value that triggered the stop
//    - times out and rejects after 30 seconds if stopCondition never met

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function asyncPoller(fn, intervalMs, stopCondition) {
    const start = Date.now();

    while (Date.now() - start < 30000) {
        const result = await fn();

        if (stopCondition(result)) {
            return result;
        }

        await delay(intervalMs);
    }

    throw new Error("Polling time out after 30 seconds");
}