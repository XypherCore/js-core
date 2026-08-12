// class Pipeline
//
// static from(data)
//   accepts: array, async iterable, or generator
//   returns a Pipeline instance
//
// pipe(...transforms)
//   chains transforms — each receives Result, returns Result
//   returns this for chaining
//
// async toArray()
//   runs pipeline, returns array of successful values
//
// async forEach(fn)
//   runs pipeline, calls fn for each successful value
//
// async reduce(fn, initial)
//   runs pipeline, reduces successful values
//
// async toFile(path)
//   writes each result as JSON line to file
//
// stats()
//   returns { processed, errors, duration } after run

import { writeFile } from "node:fs/promises";
import { Result } from "./result.js";

export class Pipeline {
    constructor(data) {
        this._data = data;
        this._transforms = [];
        this._stats = {
            processed: 0,
            errors: 0,
            duration: 0
        };
    }

    static from(data) {
        return new Pipeline(data);
    }

    pipe(...transforms) {
        this._transforms.push(...transforms);
        return this;
    }

    async toArray() {
        const output = [];

        await this.forEach(value => {
            output.push(value);
        });

        return output;
    }

    async forEach(fn) {
        const startedAt = Date.now();

        this._stats = {
            processed: 0,
            errors: 0,
            duration: 0
        };

        let stopped = false;

        for await (const item of this._data) {
            let result = Result.success(item);

            for (const transform of this._transforms) {
                result = result.flatMap(transform);

                if (!result.ok) {
                    break;
                }
            }

            if (result.stopped) {
                stopped = true;
                break;
            }

            if (result.ok) {
                fn(result.value);
                this._stats.processed++;
            } else if (!result.skipped) {
                this._stats.errors++;
            }

            if (stopped) {
                break;
            }

        }


        this._stats.duration = Date.now() - startedAt;
    }

    async reduce(fn, initial) {
        let accumulator = initial;

        await this.forEach(value => {
            accumulator = fn(accumulator, value);
        });

        return accumulator;
    }

    async toFile(path) {
        const values = await this.toArray();

        const lines = values
            .map(value => JSON.stringify(value))
            .join("\n");

        await writeFile(path, lines + "\n", "utf-8");
    }

    stats() {
        return { ...this._stats };
    }
}