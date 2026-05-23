// Day 14 — Mini Project 2: Real-Time Data Poller

// Wire everything:
// 1. create logger
// 2. create poller with interval:2000, maxRetries:3, timeout:5000
// 3. add 3 simulated sources (use Math.random() for values)
// 4. on "data" event — log the reading
// 5. on "alert" event — log with WARN or ERROR level
// 6. on "error" event — log with ERROR level
// 7. start the poller
// 8. start the status server on port 3000
// 9. handle process.on("SIGINT") for clean shutdown:
//    - stop poller
//    - stop server
//    - log "System shutdown"
//    - process.exit(0)

import { createLogger } from "./src/logger.js";
import { DataPoller } from "./src/poller.js";
import { createStatusServer } from "./src/server.js";

const logger = createLogger("./exercises/day-14-realtime-poller/app.log");

const poller = new DataPoller({
    interval: 2000,
    maxRetries: 3,
    timeout: 5000
});

poller.addSource("temp-1", async () => {
    return {
        id: "temp-1",
        type: "temp",
        value: Math.random() * 120,
        unit: "F"
    };
});
poller.addSource("pressure-2", async () => {
    return {
        id: "pressure-2",
        type: "pressure",
        value: Math.random() * 120,
        unit: "PSI"
    };
});
poller.addSource("humidity-3", async () => {
    return {
        id: "humidity-3",
        type: "humidity",
        value: Math.random() * 100,
        unit: "%"
    };
});

poller.on("data", async reading => {
    await logger.log("INFO", JSON.stringify(reading));
});
poller.on("alert", async reading => {
    if (reading.status === "critical") {
        await logger.log("ERROR", JSON.stringify(reading));
    } else {
        await logger.log("WARN", JSON.stringify(reading));
    }
});
poller.on("error", async ({ id, error }) => {
    await logger.log("ERROR", `${id}: ${error.message}`);
});

const server = createStatusServer(() => poller.getStats(), 3000);
poller.start();
server.start();
await logger.log("INFO", "System started");

process.on("SIGINT", async () => {
    poller.stop();
    server.stop();
    await logger.log("INFO", "System shutdown");
    process.exit(0);
});