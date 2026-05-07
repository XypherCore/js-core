// Day 8 — The Event Loop Deep Dive & Async Patterns


// EXERCISE----

// 1. implement debounce(fn, delay)
//    - returns a debounced version of fn
//    - has a .cancel() method to cancel pending execution
//    - has a .flush() method to execute immediately if pending

// 2. implement asyncRetryQueue(tasks, concurrency, maxRetries)
//    - tasks is an array of async functions
//    - runs them with max concurrency at once
//    - if a task fails, retry it up to maxRetries times
//    - returns array of results in original order
//    - failed tasks after all retries return { error: err.message }

// SOLUTION----


function debounce(fn, delay) {
    let timer;
    let lastThis;
    let lastArgs;

    function debounced(...args) {
        lastThis = this;
        lastArgs = args;
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(lastThis, lastArgs);
            timer = null;
        }, delay);
    }

    debounced.cancel = function () {
        clearTimeout(timer);
        timer = null;
    };

    debounced.flush = function () {
        if (timer) {
            clearTimeout(timer);
            fn.apply(lastThis, lastArgs);
            timer = null;
        }
    };

    return debounced;
}


async function asyncRetryQueue(tasks, concurrency, maxRetries) {
    const results = new Array(tasks.length);
    let nextIndex = 0;
    const workers = [];
    const workerCount = Math.min(concurrency, tasks.length);

    async function worker() {
        while (nextIndex < tasks.length) {
            const currentIndex = nextIndex;
            nextIndex++;
            let attempts = 0;

            while (attempts <= maxRetries) {
                try {
                    results[currentIndex] = await tasks[currentIndex]();
                    break;
                } catch (err) {
                    if (attempts === maxRetries) {
                        results[currentIndex] = { error: err.message };
                        break;
                    }

                    attempts++;
                }
            }
        }
    }

    for (let i = 0; i < workerCount; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    return results;
}