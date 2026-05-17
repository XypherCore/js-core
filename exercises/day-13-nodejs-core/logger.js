// Day 13 — Node.js Core

// Build a file-based logger in Node.js:----

// createLogger(logFile)
// Returns an object with:
//
// - log(level, message)
//     writes "[timestamp] [LEVEL] message\n" to the log file
//     also prints to console
//     level is "INFO", "WARN", or "ERROR"
//
// - getLogs()
//     reads the log file and returns array of parsed log entries
//     each entry: { timestamp, level, message }
//
// - clearLogs()
//     empties the log file
//
// - watchLogs(onChange)
//     watches the log file for changes
//     calls onChange with the new log entry whenever file changes

import fs from "node:fs/promises";
import { watch } from "node:fs"

function createLogger(logFile) {
    return {
        async log(level, message) {
            const timestamp = new Date().toISOString();
            const line = `[${timestamp}] [${level}] ${message}\n`;
            await fs.appendFile(logFile, line);
            console.log(line.trim());
        },

        async getLogs() {
            const content = await fs.readFile(logFile, "utf-8");
            return content
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => {
                    const parts = line.match(/^\[(.+)\] \[(.+)\] (.+)$/);
                    if (!parts) return null;

                    return {
                        timestamp: parts[1],
                        level: parts[2],
                        message: parts[3]
                    }
                })
                .filter(entry => entry !== null)
        },

        async clearLogs() {
            await fs.writeFile(logFile, "");
        },

        watchLogs(onChange) {
            const watcher = watch(logFile, async () => {
                const logs = await this.getLogs();
                const latest = logs[logs.length - 1];
                if (latest) onChange(latest);
            });

            return watcher;
        }
    }
}


// Wire it up:
// - create a logger
// - write 3 log entries of different levels
// - read them back with getLogs()
// - watch the file and write one more entry
//   (watcher should fire and print the new entry)

const logger = createLogger("app.log");

await logger.clearLogs();

await logger.log("INFO", "App started");
await logger.log("WARN", "Low memory");
await logger.log("ERROR", "Something failed");

const logs = await logger.getLogs();
console.log(logs);

const watcher = logger.watchLogs(entry => {
    console.log("New log:", entry);
});

await logger.log("INFO", "Watcher test");

setTimeout(() => {
    watcher.close();
}, 1000);