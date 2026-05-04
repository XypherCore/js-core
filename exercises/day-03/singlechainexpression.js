// Day 3 — Array & Object Mastery

// Exercise ----

// Given this raw telemetry data:

const telemetry = [
  { id: "A1", type: "temperature", value: 87, unit: "F", active: true },
  { id: "A2", type: "pressure",    value: 14, unit: "PSI", active: true },
  { id: "A3", type: "temperature", value: 210, unit: "F", active: false },
  { id: "A4", type: "humidity",    value: 65, unit: "%", active: true },
  { id: "A5", type: "temperature", value: 98, unit: "F", active: true },
  { id: "A6", type: "pressure",    value: 22, unit: "PSI", active: true },
];

// Write a single chained expression (no intermediate variables, no loops) that:

// 1. Keeps only active sensors
// 2. Keeps only temperature or pressure types
// 3. Converts Fahrenheit to Celsius: (F - 32) * 5/9 — only for temperature, round to 1 decimal. Pressure stays as-is
// 4. Reshapes each into { id, type, display: "value unit" } — e.g. "31.1 C" or "14 PSI"
// 5. Sorts by id ascending

const result = telemetry
    .filter(a => a.active)
    .filter(t => t.type === "temperature" || t.type === "pressure" )
    .map(s => {
        const isCelsius = s.type === "temperature";
        const value = isCelsius ? ((s.value - 32) * 5/9).toFixed(1) : s.value;
        const unit = isCelsius ? "C" : s.unit;

        return {
            id: s.id,
            type: s.type,
            display: `${value} ${unit}`
        }
    })

console.log(result);