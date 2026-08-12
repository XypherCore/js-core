// Async stream utilities
//
// fromWebSocket(ws)
//   returns async iterable from WebSocket messages
//
// fromInterval(fn, ms)
//   calls fn every ms, yields results as async iterable
//
// merge(...iterables)
//   merges multiple async iterables into one stream
//
// throttle(iterable, ms)
//   limits emission rate to one per ms

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function* fromWebSocket(ws) {
    const queue = [];
    let done = false;
    let error = null;
    let notify = null;

    const wake = () => {
        notify?.();
        notify = null;
    };

    ws.addEventListener("message", event => {
        queue.push(event.data);
        wake();
    });

    ws.addEventListener("close", () => {
        done = true;
        wake();
    });

    ws.addEventListener("error", event => {
        error = event;
        wake();
    }); 

    while (!done || queue.length > 0) {
        if (error) {
            throw error;
        }

        if (queue.length > 0) {
            yield queue.shift();
            continue;
        }

        await new Promise(resolve => {
            notify = resolve;
        });
    }
}

export async function* fromInterval(fn, ms) {
    while (true) {
        yield await fn();
        await sleep(ms);
    }
}

export async function* merge(...iterables) {
    const iterators = iterables.map(iterable => iterable[Symbol.asyncIterator]());

    const read = index =>
        iterators[index].next().then(result => ({ index, result }));

    let reads = iterators.map((_, index) => read(index));

    while (reads.length > 0) {
        const settled = await Promise.race(reads);
        const readIndex = reads.indexOf(reads.find((_, index) => index === settled.index));

        if (settled.result.done) {
            reads = reads.filter((_, index) => index !== settled.index);
            iterators.splice(settled.index, 1);
            reads = iterators.map((_, index) => read(index));
            continue;
        }

        yield settled.result.value;
        reads[settled.index] = read(settled.index);
    }
}

export async function* throttle(iterable, ms) {
    let lastEmittedAt = 0;

    for await (const item of iterable) {
        const now = Date.now();
        const wait = ms - (now - lastEmittedAt);

        if (wait > 0) {
            await sleep(wait);
        }

        lastEmittedAt = Date.now();
        yield item;
    }
}