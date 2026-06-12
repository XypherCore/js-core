// Pure transform functions — all return Result


import { Result } from "./result.js";

// validate(schema) → transform function
//   schema: { [field]: { type, required, min, max } }
//   returns Result.success(data) or Result.failure(error)

export const validate = function (schema) {
    return function (data) {
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            if (rules.required && value === undefined) {
                return Result.failure(`${field} is required`);
            }
            if (value === undefined) {
                continue;
            }
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

        return Result.success(data);
    };
};

// normalize(fields) → transform function
//   fields: array of field names to normalize to 0-100 range
//   uses min/max across the dataset — accepts array of items

export const normalize = (fields, min, max) => item => {
    const normalized = { ...item };
    for (const field of fields) {
        normalized[field] = max === min ? 0
            : ((item[field] - min) / (max - min)) * 100;
    }
    return Result.success(normalized);
};

// tag(rules) → transform function
//   rules: array of { condition: fn, label: string }
//   adds tags array to each item based on which conditions pass

export const tag = rules => item => {
    const tags = rules
        .filter(rule => rule.condition(item))
        .map(rule => rule.label);
    return Result.success({ ...item, tags });
};

// project(fields) → transform function
//   keeps only specified fields from each item
//   returns Result.success with projected object

export const project = function (fields) {
    return function (item) {
        const projected = {};

        for (const field of fields) {
            projected[field] = item[field];
        }

        return Result.success(projected);
    };
};