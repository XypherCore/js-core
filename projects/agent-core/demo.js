// Build a monitoring agent that:
//
// Perception sources:
//   - temperature sensor (random 15-45°C, every 2s)
//   - load sensor (random 0-100%, every 3s)
//
// Memory:
//   - tracks: tempAlert, loadAlert, cycleCount
//
// Decision rules:
//   - if temp > 35: execute "cooldown" action
//   - if load > 80: execute "scaleUp" action
//   - if temp normal AND load normal: execute "idle" action
//
// Actions:
//   - cooldown: log warning, set memory.tempAlert = true
//   - scaleUp: log warning, set memory.loadAlert = true
//   - idle: set both alerts to false
//
// Run for 20 seconds, print status every 5 seconds
// Graceful shutdown on SIGINT

import {
    Agent,
    createActionRegistry,
    createDecisionEngine,
    createLogger,
    createMemory,
    createPerception
} from "./index.js";

const logger = createLogger(new URL("./agent-demo.log", import.meta.url));

const randomBetween = (min, max) => {
    return Math.round(min + Math.random() * (max - min));
};

const memory = createMemory({
    tempAlert: false,
    loadAlert: false,
    cycleCount: 0
});

const perception = createPerception([
    {
        id: "temperature",
        interval: 2000,
        async fn() {
            return {
                value: randomBetween(15, 45),
                unit: "C"
            };
        }
    },
    {
        id: "load",
        interval: 3000,
        async fn() {
            return {
                value: randomBetween(0, 100),
                unit: "%"
            };
        }
    }
]);

function getTemperature(perception) {
    return perception.getLatest().temperature?.data.value;
}

function getLoad(perception) {
    return perception.getLatest().load?.data.value;
}

const decisions = createDecisionEngine([
    {
        name: "high-temperature",
        action: "cooldown",
        priority: 100,
        cooldown: 5000,
        condition(perception) {
            const temperature = getTemperature(perception);

            return typeof temperature === "number" && temperature > 35;
        }
    },
    {
        name: "high-load",
        action: "scaleUp",
        priority: 90,
        cooldown: 5000,
        condition(perception) {
            const load = getLoad(perception);

            return typeof load === "number" && load > 80;
        }
    },
    {
        name: "normal-state",
        action: "idle",
        priority: 10,
        cooldown: 2000,
        condition(perception) {
            const temperature = getTemperature(perception);
            const load = getLoad(perception);

            return (
                typeof temperature === "number" &&
                typeof load === "number" &&
                temperature <= 35 &&
                load <= 80
            );
        }
    }
]);

const actions = createActionRegistry();

actions.register("cooldown", async (context, memory) => {
    const temperature = context.perception.temperature.data.value;

    memory.set("tempAlert", true);

    await logger.warn(`Cooldown triggered. Temperature is ${temperature}C`);

    return {
        cooldown: true,
        temperature
    };
});

actions.register("scaleUp", async (context, memory) => {
    const load = context.perception.load.data.value;

    memory.set("loadAlert", true);

    await logger.warn(`Scale up triggered. Load is ${load}%`);

    return {
        scaling: true,
        load
    };
});

actions.register("idle", async (context, memory) => {
    memory.set("tempAlert", false);
    memory.set("loadAlert", false);

    await logger.info("System idle. Temperature and load are normal.");

    return {
        idle: true
    };
});

const agent = new Agent({
    name: "monitoring-agent",
    perception,
    decisions,
    actions,
    memory,
    logger
});

agent.on("started", (status) => {
    console.log("Agent started:", status.name);
});

agent.on("cycle", ({ perception, decisions, actions }) => {
    memory.set("cycleCount", memory.get("cycleCount") + 1);

    console.log("Cycle:", {
        source: perception.sourceId,
        data: perception.data,
        decisions: decisions.map((decision) => decision.rule),
        actions: actions.map((action) => action.action)
    });
});

agent.on("error", (error) => {
    console.log("Agent error:", error);
});

agent.on("stopped", (status) => {
    console.log("Agent stopped:", status);
});

const statusTimer = setInterval(() => {
    console.log("Status:", agent.getStatus());
}, 5000);

function shutdown() {
    clearInterval(statusTimer);
    agent.stop();
}

process.on("SIGINT", () => {
    console.log("\nGracefully shutting down...");
    shutdown();
    process.exit(0);
});

agent.start();

setTimeout(() => {
    console.log("20 seconds complete. Shutting down...");
    shutdown();
}, 20000);
