// Day 21 — Mini Project 3: Intelligent Data Pipeline

// Wire up a complete pipeline:
//
// Source: async generator producing 20 sensor readings
//   { id, type, value: random 0-150, unit }
//
// Transforms:
//   1. validate — id required, value must be number
//   2. normalize — clamp value to 0-100
//   3. tag — tag as critical/warning/normal based on value
//   4. project — keep only { id, value, tags }
//
// Sink: log each result, count totals
//
// Print final stats: processed, errors, duration

import {
    Observable,
    Pipeline,
    validate,
    normalize,
    tag,
    project
} from "./index.js";

function* sensorReadings(count) {
    const types = ["temperature", "pressure", "humidity"];

    for (let i = 1; i <= count; i++) {
        yield {
            id: i,
            type: types[i % types.length],
            value: Math.floor(Math.random() * 151),
            unit: "raw"
        };
    }
}

const source = Observable.fromGenerator(sensorReadings(20));

const schema = {
    id: { type: "number", required: true },
    type: { type: "string", required: true },
    value: { type: "number", required: true },
    unit: { type: "string", required: true }
};

const tagRules = [
    {
        condition: item => item.value >= 85,
        label: "critical",
    },
    {
        condition: item => item.value >= 60 && item.value < 85,
        label: "warning"
    },
    {
        condition: item => item.value < 60,
        label: "normal"
    }
];

const totals = {
    critical: 0,
    warning: 0,
    normal: 0
};

const stats = await new Pipeline({
    onError: err => console.error("Pipeline error", err)
})
    .source(source)
    .transform(
        validate(schema),
        normalize(["value"], 0, 150),
        tag(tagRules),
        project(["id", "value", "tags"])
    )
    .sink(item => {
        for (const label of item.tags) {
            totals[label]++;
        }

        console.log(item);
    })
    .run();

console.log("Totals:", totals);
console.log("Stats:", stats);