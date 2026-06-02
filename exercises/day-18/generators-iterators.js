// Day 18 — Generators & Iterators


// 1. function* fibonacci()
//    - infinite generator
//    - yields Fibonacci numbers: 0, 1, 1, 2, 3, 5, 8, 13...
//    - no arguments needed

function* fibonacci() {
    let current = 0;
    let next = 1;
    while (true) {
        const oldCurrent = current
        yield current;
        current = next;
        next = oldCurrent + next;
    }
}


// 2. function take(iterable, n)
//    - takes any iterable (including infinite generators)
//    - returns array of first n values

function take(iterable, n) {
    const result = [];
    if (n <= 0) return [];

    for (const value of iterable) {
        result.push(value);
        if (result.length === n) break;
    }

    return result;
}


// 3. async function* sensorStream(sources, intervalMs)
//    - sources is an array of async functions that return readings
//    - yields one reading per source per interval
//    - never stops on its own — caller controls when to stop
//    - each yielded value: { sourceIndex, reading, timestamp }
//
//    Wire it up:
//    const stream = sensorStream([
//      async () => ({ value: Math.random() * 100 }),
//      async () => ({ value: Math.random() * 100 }),
//    ], 1000);
//
//    consume 6 readings with for await...of then stop

async function* sensorStream(sources, intervalMs) {
    while (true) {
        for (let i = 0; i < sources.length; i++) {
            const reading = await sources[i]();
            yield { sourceIndex: i, reading, timestamp: Date.now() };
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
}

async function monitor() {
    const stream = sensorStream([
        async () => ({ value: Math.random() * 100 }),
        async () => ({ value: Math.random() * 100 }),
    ], 1000);

    let count = 0;

    for await (const data of stream) {
        console.log(data);
        count++;

        if (count === 6) break;
    }
}
monitor();