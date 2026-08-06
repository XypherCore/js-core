// 1. create logger
// 2. create alert engine with default rules
// 3. create monitor with 2000ms interval
// 4. create server on port 3000
// 5. on "metric" — log at INFO level every 5th reading (avoid log spam)
// 6. on "alert"  — log at WARN or ERROR based on severity
// 7. on "stopped" — log "Monitor stopped"
// 8. start monitor and server
// 9. handle SIGINT — stop monitor, stop server, log shutdown, exit

import { createAlertEngine } from "./src/alerting.js";
import { createServer } from "./src/server.js";
import { Monitor } from "./src/monitor.js";
import { createLogger } from "./src/logger.js";

const logger = createLogger("sentinal.log");
const alertEngine = createAlertEngine();

const monitor = new Monitor({
  interval: 2000,
  alertEngine,
});

const server = createServer(monitor, 3000);

monitor.on("metric", async (metric) => {
  if (monitor.totalReadings % 5 === 0) {
    await logger.log(
      "INFO",
      `Metric received: ${metric.type} ${metric.value}${metric.unit}`
    );
  }
});

monitor.on("alert", async (alert) => {
  const level = alert.rule.severity === "critical" ? "ERROR" : "WARN";

  await logger.log(
    level,
    `${alert.rule.name}: ${alert.metric.value}${alert.metric.unit}`
  );
});

monitor.on("stopped", async () => {
  await logger.log("INFO", "Monitor stopped");
});

monitor.start();
server.start();

process.on("SIGINT", async () => {
  await logger.log("INFO", "Shutting down");

  monitor.stop();
  server.stop();

  process.exit(0);
});