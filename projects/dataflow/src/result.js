// Same result class from Day 15

export class Result {
    constructor(ok, value, error, skipped = false, stopped = false) {
        this.ok = ok;
        this.value = value;
        this.error = error;
        this.skipped = skipped;
        this.stopped = stopped;
    }

    static success(value) {
        return new Result(true, value, null);
    }

    static failure(error) {
        return new Result(false, null, error);
    }

    static skip() {
        return new Result(false, null, null, true);
    }

    static stop() {
        return new Result(false, null, null, true, true);
    }

    map(fn) {
        if (!this.ok) return this;
        try {
            return Result.success(fn(this.value));
        } catch (err) {
            return Result.failure(err.message);
        }
    }

    flatMap(fn) {
        if (!this.ok) return this;
        try {
            return fn(this.value);
        } catch (err) {
            return Result.failure(err.message);
        }
    }

    getOrElse(defaultValue) {
        return this.ok ? this.value : defaultValue;
    }

    tap(fn) {
        if (this.ok) fn(this.value);
        return this;
    }
}