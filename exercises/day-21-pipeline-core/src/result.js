// Result Class from Day 15

export class Result {
    constructor(ok, value, error) {
        this.ok = ok;
        this.value = value;
        this.error = error;
    }

    static success(value) {
        return new Result(true, value, null);
    }

    static failure(error) {
        return new Result(false, null, error);
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