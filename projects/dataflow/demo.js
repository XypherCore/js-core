// Three demos showing the library in action:
//
// Demo 1 — Array pipeline
//   Process 50 sensor readings through validate, normalize, tag, project
//   Print summary stats
//
// Demo 2 — Generator pipeline
//   Infinite fibonacci generator → limit(10) → map to { index, value }
//   Collect and print
//
// Demo 3 — Async stream
//   fromInterval generating readings every 500ms
//   pipe through transforms
//   forEach to log results
//   stop after 10 readings

import { Pipeline, transforms, stream } from "./index.js";

const {
    validate,
    normalize,
    tag,
    project,
    map,
    filter,
    dedupe,
    batch,
    limit
} = transforms;

const readings = [
    { id: "a1", sensor: "temp", value: 20 },
    { id: "a2", sensor: "temp", value: 45 },
    { id: "a3", sensor: "pressure", value: 80 },
    { id: "a3", sensor: "pressure", value: 82 },
    { id: "a1", sensor: "temp", value: 100 },
    { id: "bad", sensor: "temp", value: "high" }
];

const schema = {
    id: { type: "string", required: true },
    sensor: { type: "string", required: true },
    value: { type: "number", required: true, min: 0, max: 100 }
};

const rules = [
    {
        label: "warn",
        condition: item => item.value >= 40
    },
    {
        label: "critical",
        condition: item => item.value >= 80
    }
];

console.log("\n=== Demo 1: Array Pipeline ===");

const pipeline = Pipeline
    .from(readings)
    .pipe(
        validate(schema),
        dedupe(item => item.id),
        filter(item => item.sensor === "temp"),
        normalize(0, 100, "value"),
        tag(rules),
        project(["id", "sensor", "value", "tags"])
    );

const result = await pipeline.toArray();

console.log("Processed readings:");
console.log(result);

console.log("Stats:");
console.log(pipeline.stats());

const batches = await Pipeline
    .from(readings)
    .pipe(
        validate(schema),
        batch(2)
    )
    .toArray();

console.log("Batches:");
console.log(batches);

console.log("\n=== Demo 2: Generator Pipeline ===");

function* fibonacci() {
    let previous = 0;
    let current = 1;
    let index = 0;

    while (true) {
        yield {
            index, 
            value: previous
        };

        const next = previous + current;
        previous = current;
        current = next;
        index++;
    }
}

const fibonacciValues = await Pipeline
    .from(fibonacci())
    .pipe(
        limit(10),
        map(item => ({
            ...item,
            parity: item.value % 2 === 0 ? "even" : "odd"
        }))
    )
    .toArray();

console.log("Fibonacci:");
console.log(fibonacciValues);

console.log("\n=== Demo 3: Async Stream ===");

let count = 0;
const asyncStream = stream.fromInterval(
    async () => ({ id: `s${count++}`, value: Math.random() * 100 }),
    500
);

const streamPipeline = Pipeline
    .from(asyncStream)
    .pipe(
        limit(10),
        normalize(0, 100, "value"),
        project(["id", "value"])
    );

await streamPipeline.forEach(item => console.log("stream:", item));

console.log("Stream stats:", streamPipeline.stats());
