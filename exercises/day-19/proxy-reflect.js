// Day 19 — Proxy & Reflect


// 1. createReadOnly(obj)
//    - returns a proxy that allows reads
//    - throws on any set, delete, or defineProperty attempt
//    - nested objects must also be read-only

function createReadOnly(obj) {
    return new Proxy(obj, {
        get(obj, prop) {
            const value = Reflect.get(obj, prop);

            if (value !== null && typeof value === "object") {
                return createReadOnly(value);
            }

            return value;
        },

        set() {
            throw new Error("Object is read-only");
        },

        deleteProperty() {
            throw new Error("Object is read-only");
        },

        defineProperty() {
            throw new Error("Object is read-only");
        }
    });
}


// 2. createLogger(obj, logFn)
//    - logs every get and set with property name and value
//    - does not block any operations
//    - logFn receives: { operation, prop, value, oldValue }

function createLogger(obj, logFn) {
    return new Proxy(obj, {
        get(obj, prop) {
            const value = Reflect.get(obj, prop);

            logFn({
                operation: "get",
                prop,
                value,
                oldValue: undefined
            });

            return value;
        },

        set(obj, prop, value) {
            const oldValue = Reflect.get(obj, prop);

            logFn({
                operation: "set",
                prop,
                value,
                oldValue
            });

            return Reflect.set(obj, prop, value);
        }
    });
}


// 3. createSchema(schema)
//    - returns a function that creates validated objects
//    - schema defines: { type, required, min, max, enum }
//    - enum: array of allowed values
//    - throws descriptive errors on invalid set
//    - throws if required field is accessed before being set
//

function createSchema(schema) {
    return function () {
        const data = {};

        return new Proxy(data, {
            set(data, prop, value) {
                if (schema[prop]) {
                    const { type, required, min, max, enum: enumValues } = schema[prop];

                    if (type && typeof value !== type) {
                        throw new TypeError(`${prop} must be ${type}, got ${typeof value}`);
                    }
                    if (min !== undefined && value < min) {
                        throw new RangeError(`${prop} must be >= ${min}`);
                    }
                    if (max !== undefined && value > max) {
                        throw new RangeError(`${prop} must be <= ${max}`);
                    }
                    if (enumValues && !enumValues.includes(value)) {
                        throw new Error(`${prop} must be one of ${enumValues.join(", ")}`);
                    }
                }
                return Reflect.set(data, prop, value);
            },

            get(data, prop) {
                if (schema[prop]?.required && !(prop in data)) {
                    throw new Error(`${prop} is required but not set`);
                }
                return Reflect.get(data, prop);
            }
        });
    }
}


//    Usage:
//    const SensorReading = createSchema({
//      id:     { type: "string", required: true },
//      value:  { type: "number", min: 0, max: 100 },
//      status: { type: "string", enum: ["normal", "warning", "critical"] }
//    });
//
//    const reading = SensorReading();
//    reading.id = "S1";
//    reading.value = 42;
//    reading.status = "normal";
//    reading.status = "unknown"; // Error: status must be one of normal, warning, critical