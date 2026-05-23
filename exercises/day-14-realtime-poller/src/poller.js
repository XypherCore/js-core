// class DataPoller extends EventEmitter
//
// constructor(options)
//   options: { interval, maxRetries, timeout }
//
// addSource(id, fetchFn)
//   registers a data source — fetchFn is async, returns a reading
//
// start()
//   begins polling all sources at options.interval
//   each poll:
//     - calls fetchFn with withTimeout(options.timeout)
//     - retries up to maxRetries on failure
//     - processes reading through pipeline
//     - emits "data" with processed reading
//     - emits "alert" if status is critical or warning
//     - emits "error" if all retries fail
//
// stop()
//   stops polling, emits "stopped"
//
// getStats()
//   returns { sources, totalPolls, errors, uptime }


import { EventEmitter } from "./emitter.js";
import { processReading } from "./pipeline.js";


const withTimeout = (promise, timeout) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timed out")), timeout);
        })
    ]);
};


export class DataPoller extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.sources = new Map();
        this.totalPolls = 0;
        this.startedAt = null;
        this.timer = null;
        this.errors = 0;
    }

    addSource(id, fetchFn) {
        this.sources.set(id, fetchFn);
        return this;
    }

    start() {
        this.startedAt = Date.now();

        this.timer = setInterval(async () => {
            for (const [id, fetchFn] of this.sources) {
                for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
                    try {
                        const reading = await withTimeout(fetchFn(), this.options.timeout);
                        this.totalPolls++;
                        const processedReading = processReading(reading);
                        if (!processedReading) continue;
                        this.emit("data", processedReading);
                        if (processedReading.status === "critical" || processedReading.status === "warning") {
                            this.emit("alert", processedReading);
                        }
                        break;
                    } catch (error) {
                        if (attempt === this.options.maxRetries) {
                            this.errors++;
                            this.emit("error", { id, error });
                        }
                    }
                }
            }
        }, this.options.interval);

        return this;
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
        this.emit("stopped");
        return this;
    }

    getStats() {
        return {
            sources: this.sources.size,
            totalPolls: this.totalPolls,
            errors: this.errors,
            uptime: this.startedAt ? Date.now() - this.startedAt : 0
        };
    }
}