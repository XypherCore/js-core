// class Pipeline
//
// constructor(options)
//   options: { bufferSize, concurrency, onError }
//
// source(observable)
//   set the data source
//
// transform(...fns)
//   add transform functions — each receives a Result, returns a Result
//
// sink(fn)
//   set the output handler — called with each successful Result value
//
// run()
//   executes the pipeline
//   returns Promise<{ processed, errors, duration }>


import { Result } from "./result.js";

export class Pipeline {
    constructor(options = {}) {
        this.bufferSize = options.bufferSize ?? 100;
        this.concurrency = options.concurrency ?? 1;
        this.onError = options.onError ?? (() => {});

        this._source = null;
        this._transforms = [];
        this._sink = null;
    }

    source(observable) {
        this._source = observable;
        return this;
    }

    transform(...fns) {
        this._transforms.push(...fns);
        return this;
    }

    sink(fn) {
        this._sink = fn;
        return this;
    }

    run() {
        const startedAt = Date.now();
        let processed = 0;
        let errors = 0;

        return new Promise(resolve => {
            this._source.subscribe({
                next: item => {
                    let result = Result.success(item);

                    for (const transform of this._transforms) {
                        result = result.flatMap(transform);

                        if (!result.ok) {
                            break;
                        }
                    }

                    if (result.ok) {
                        this._sink(result.value);
                        processed++;
                    } else {
                        errors++;
                        this.onError(result.error);
                    }
                },

                error: err => {
                    errors++;
                    this.onError(err);
                },

                complete: () => {
                    resolve({
                        processed,
                        errors,
                        duration: Date.now() - startedAt
                    });
                }
            });
        });
    }
}