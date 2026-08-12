// Built-in transforms — all are curried, all return Result
//
// map(fn)           — transform each value
// filter(pred)      — keep values matching predicate
// validate(schema)  — validate shape and types
// normalize(min, max, field) — normalize a field to 0-100
// tag(rules)        — add tags array based on conditions
// project(fields)   — keep only specified fields
// limit(n)          — pass only first n items
// dedupe(keyFn)     — skip duplicate values by key
// batch(size)       — group items into arrays of size n

import { Result } from "./result.js"

export const map = fn => item =>
    Result.success(fn(item));

export const filter = pred => item =>
    pred(item)
        ? Result.success(item)
        : Result.skip();

export const validate = schema => item => {
    for (const [field, rules] of Object.entries(schema)) {
        const value = item[field];

        if (rules.required && value === undefined) {
            return Result.failure(`${field} is required`);
        }

        if (value === undefined) continue;

        if (rules.type && typeof value !== rules.type) {
            return Result.failure(`${field} must be ${rules.type}`);
        }

        if (rules.min !== undefined && value < rules.min) {
            return Result.failure(`${field} must be at least ${rules.min}`);
        }

        if (rules.max !== undefined && value > rules.max) {
            return Result.failure(`${field} must be at most ${rules.max}`);
        }
    }

    return Result.success(item);
};

export const normalize = (min, max, field) => item => {
    const value = item[field];

    if (typeof value !== "number") {
        return Result.failure(`${field} must be number`);
    }

    const normalized = max === min
        ? 0
        : ((value - min) / (max - min)) * 100;

    return Result.success({
        ...item,
        [field]: normalized
    });
};

export const tag = rules => item => {
    const tags = rules
        .filter(rule => rule.condition(item))
        .map(rule => rule.label);

    return Result.success({
        ...item,
        tags
    });
};

export const project = fields => item => {
    const projected = {};

    for (const field of fields) {
        projected[field] = item[field];
    }

    return Result.success(projected);
};

export const limit = n => {
    let count = 0;

    return item => {
        if (count >= n) {
            return Result.stop();
        }

        count++;
        return Result.success(item);
    };
};

export const dedupe = keyFn => {
    const seen = new Set();

    return item => {
        const key = keyFn(item);

        if (seen.has(key)) {
            return Result.skip(`Duplicate key: ${key}`);
        }

        seen.add(key);
        return Result.success(item);
    };
};

export const batch = size => {
    let items = [];

    return item => {
        items.push(item);

        if (items.length < size) {
            return Result.skip();
        }

        const batchItems = items;
        items = [];

        return Result.success(batchItems);
    };
};